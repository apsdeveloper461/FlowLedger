import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'otp_hash', nullable: true, type: 'varchar' })
  otpHash: string | null;

  @Column({ name: 'otp_expires_at', nullable: true, type: 'timestamptz' })
  otpExpiresAt: Date | null;

  @Column({ name: 'otp_purpose', nullable: true, type: 'varchar' })
  otpPurpose: string | null; // 'verify_email' | 'reset_password'

  @Column({ name: 'reset_token_hash', nullable: true, type: 'varchar' })
  resetTokenHash: string | null;

  @Column({ name: 'reset_token_expires_at', nullable: true, type: 'timestamptz' })
  resetTokenExpiresAt: Date | null;

  @Column({ name: 'refresh_token_hash', nullable: true, type: 'varchar' })
  refreshTokenHash: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
