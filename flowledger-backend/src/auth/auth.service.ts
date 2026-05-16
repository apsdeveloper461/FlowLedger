import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

const BCRYPT_ROUNDS = 10;
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface AuthResult extends TokenPair {
  user: Omit<User, 'passwordHash' | 'otpHash' | 'refreshTokenHash' | 'resetTokenHash'>;
}

@Injectable()
export class AuthService {
  private readonly mailer: nodemailer.Transporter;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.mailer = nodemailer.createTransport({
      host: this.configService.get<string>('mail.host'),
      port: this.configService.get<number>('mail.port'),
      auth: {
        user: this.configService.get<string>('mail.user'),
        pass: this.configService.get<string>('mail.pass'),
      },
    });
  }

  // ─── Register ──────────────────────────────────────────────────────────────

  async register(dto: RegisterDto): Promise<{ message: string }> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const { otpPlain, otpHash } = await this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);

    await this.usersService.create({
      fullName: dto.fullName,
      email: dto.email,
      passwordHash,
      isVerified: false,
      otpHash,
      otpExpiresAt,
      otpPurpose: 'verify_email',
    });

    await this.sendOtpEmail(dto.email, dto.fullName, otpPlain, 'verify_email');

    return { message: 'Registration successful. Check your email for the OTP.' };
  }

  // ─── Verify OTP ────────────────────────────────────────────────────────────

  async verifyOtp(dto: VerifyOtpDto): Promise<AuthResult> {
    const user = await this.findUserOrThrow(dto.email);

    if (user.isVerified) {
      throw new BadRequestException('Email already verified.');
    }

    await this.validateOtp(user, dto.otp, 'verify_email');

    await this.usersService.update(user.id, {
      isVerified: true,
      otpHash: null,
      otpExpiresAt: null,
      otpPurpose: null,
    });

    const updatedUser = (await this.usersService.findById(user.id))!;
    return this.issueTokensAndSave(updatedUser);
  }

  // ─── Resend OTP ────────────────────────────────────────────────────────────

  async resendOtp(email: string): Promise<{ message: string }> {
    const user = await this.findUserOrThrow(email);

    if (user.isVerified) {
      throw new BadRequestException('Email is already verified.');
    }

    const { otpPlain, otpHash } = await this.generateOtp();

    await this.usersService.update(user.id, {
      otpHash,
      otpExpiresAt: new Date(Date.now() + OTP_TTL_MS),
      otpPurpose: 'verify_email',
    });

    await this.sendOtpEmail(email, user.fullName, otpPlain, 'verify_email');

    return { message: 'New OTP sent to your email.' };
  }

  // ─── Login ─────────────────────────────────────────────────────────────────

  async validateLocalUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return null;

    return user;
  }

  async login(user: User): Promise<AuthResult> {
    if (!user.isVerified) {
      // Resend OTP silently
      const { otpPlain, otpHash } = await this.generateOtp();
      await this.usersService.update(user.id, {
        otpHash,
        otpExpiresAt: new Date(Date.now() + OTP_TTL_MS),
        otpPurpose: 'verify_email',
      });
      await this.sendOtpEmail(user.email, user.fullName, otpPlain, 'verify_email');

      throw new UnauthorizedException({
        message: 'Email not verified. A new OTP has been sent.',
        redirectTo: '/verify-email',
        email: user.email,
      });
    }

    return this.issueTokensAndSave(user);
  }

  // ─── Forgot Password ───────────────────────────────────────────────────────

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(dto.email);
    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'If that email exists, a reset OTP has been sent.' };
    }

    const { otpPlain, otpHash } = await this.generateOtp();
    await this.usersService.update(user.id, {
      otpHash,
      otpExpiresAt: new Date(Date.now() + OTP_TTL_MS),
      otpPurpose: 'reset_password',
    });

    await this.sendOtpEmail(user.email, user.fullName, otpPlain, 'reset_password');

    return { message: 'If that email exists, a reset OTP has been sent.' };
  }

  async verifyResetOtp(dto: VerifyOtpDto): Promise<{ resetToken: string }> {
    const user = await this.findUserOrThrow(dto.email);
    await this.validateOtp(user, dto.otp, 'reset_password');

    // Issue a short-lived reset token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(rawToken, BCRYPT_ROUNDS);

    await this.usersService.update(user.id, {
      otpHash: null,
      otpExpiresAt: null,
      otpPurpose: null,
      resetTokenHash: tokenHash,
      resetTokenExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    });

    return { resetToken: rawToken };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    // Find user by scanning reset tokens (decoded from JWT or plaintext token)
    // We store a hash, so we need to find by email embedded in the token or scan
    // Strategy: encode userId in the raw token (prefix it)
    const [userId, ...rest] = dto.resetToken.split(':');
    const rawToken = rest.join(':');

    if (!userId || !rawToken) {
      throw new BadRequestException('Invalid reset token.');
    }

    const user = await this.usersService.findById(userId);
    if (!user || !user.resetTokenHash || !user.resetTokenExpiresAt) {
      throw new BadRequestException('Invalid or expired reset token.');
    }

    if (new Date() > user.resetTokenExpiresAt) {
      throw new BadRequestException('Reset token has expired.');
    }

    const isValid = await bcrypt.compare(rawToken, user.resetTokenHash);
    if (!isValid) {
      throw new BadRequestException('Invalid reset token.');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);

    await this.usersService.update(user.id, {
      passwordHash,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
      refreshTokenHash: null, // Invalidate all sessions
    });

    return { message: 'Password reset successfully. Please login.' };
  }

  // ─── Token Refresh ─────────────────────────────────────────────────────────

  async refreshTokens(userId: string, refreshToken: string): Promise<TokenPair> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Access denied.');
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isValid) {
      throw new UnauthorizedException('Access denied.');
    }

    const tokens = await this.generateTokenPair(user);
    const rtHash = await bcrypt.hash(tokens.refreshToken, BCRYPT_ROUNDS);
    await this.usersService.update(user.id, { refreshTokenHash: rtHash });

    return tokens;
  }

  // ─── Logout ────────────────────────────────────────────────────────────────

  async logout(userId: string): Promise<{ message: string }> {
    await this.usersService.update(userId, { refreshTokenHash: null });
    return { message: 'Logged out successfully.' };
  }

  // ─── Private Helpers ───────────────────────────────────────────────────────

  private async generateOtp(): Promise<{ otpPlain: string; otpHash: string }> {
    const otpPlain = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otpPlain, BCRYPT_ROUNDS);
    return { otpPlain, otpHash };
  }

  private async validateOtp(
    user: User,
    otpPlain: string,
    purpose: string,
  ): Promise<void> {
    if (!user.otpHash || !user.otpExpiresAt || user.otpPurpose !== purpose) {
      throw new BadRequestException('No pending OTP for this action.');
    }

    if (new Date() > user.otpExpiresAt) {
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }

    const isValid = await bcrypt.compare(otpPlain, user.otpHash);
    if (!isValid) {
      throw new BadRequestException('Invalid OTP.');
    }
  }

  private async generateTokenPair(user: User): Promise<TokenPair> {
    const payload = {
      sub: user.id,
      email: user.email,
      isVerified: user.isVerified,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: (this.configService.get<string>('jwt.expiresIn') || '15m') as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: (this.configService.get<string>('jwt.refreshExpiresIn') || '7d') as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async issueTokensAndSave(user: User): Promise<AuthResult> {
    const tokens = await this.generateTokenPair(user);
    const rtHash = await bcrypt.hash(tokens.refreshToken, BCRYPT_ROUNDS);
    await this.usersService.update(user.id, { refreshTokenHash: rtHash });

    // Return the reset token prefixed with userId for password-reset flow
    const { passwordHash, otpHash, refreshTokenHash, resetTokenHash, ...safeUser } = user;
    void passwordHash; void otpHash; void refreshTokenHash; void resetTokenHash;

    return { ...tokens, user: safeUser };
  }

  private async findUserOrThrow(email: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return user;
  }

  private async sendOtpEmail(
    email: string,
    fullName: string,
    otp: string,
    purpose: 'verify_email' | 'reset_password',
  ): Promise<void> {
    const subject =
      purpose === 'verify_email'
        ? 'FlowLedger — Verify your email'
        : 'FlowLedger — Password reset OTP';

    const action =
      purpose === 'verify_email' ? 'verify your email address' : 'reset your password';

    await this.mailer.sendMail({
      from: this.configService.get<string>('mail.from'),
      to: email,
      subject,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0f0f11;color:#f5f5f5;border-radius:12px;">
          <h2 style="color:#f97316;margin-bottom:8px;">FlowLedger</h2>
          <p style="font-size:15px;color:#a1a1aa;">Hi ${fullName},</p>
          <p style="font-size:15px;color:#a1a1aa;">Use the OTP below to ${action}. It expires in <strong>10 minutes</strong>.</p>
          <div style="background:#1c1c1e;border-radius:10px;padding:24px;text-align:center;margin:24px 0;">
            <span style="font-size:36px;font-weight:700;letter-spacing:12px;color:#f97316;">${otp}</span>
          </div>
          <p style="font-size:13px;color:#71717a;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
  }

  // ─── Public helper for password reset token construction ──────────────────

  async prepareResetToken(userId: string, rawToken: string): Promise<string> {
    return `${userId}:${rawToken}`;
  }
}
