import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletsRepo: Repository<Wallet>,
  ) {}

  async findAllByUser(userId: string): Promise<Wallet[]> {
    return this.walletsRepo.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Wallet> {
    const wallet = await this.walletsRepo.findOneBy({ id, userId });
    if (!wallet) throw new NotFoundException('Wallet not found.');
    return wallet;
  }

  async create(userId: string, dto: CreateWalletDto): Promise<Wallet> {
    const wallet = this.walletsRepo.create({
      userId,
      name: dto.name,
      type: dto.type,
      balance: dto.initialBalance ?? 0,
      color: dto.color,
    });
    return this.walletsRepo.save(wallet);
  }

  async update(id: string, userId: string, dto: UpdateWalletDto): Promise<Wallet> {
    const wallet = await this.findOne(id, userId);
    Object.assign(wallet, dto);
    return this.walletsRepo.save(wallet);
  }

  async archive(id: string, userId: string): Promise<Wallet> {
    const wallet = await this.findOne(id, userId);
    wallet.isArchived = true;
    return this.walletsRepo.save(wallet);
  }

  async delete(id: string, userId: string): Promise<{ message: string }> {
    const wallet = await this.findOne(id, userId);

    // Check if any transactions reference this wallet
    const txCount = await this.walletsRepo.manager.count('transactions', {
      where: [{ walletId: id }, { toWalletId: id }],
    });

    if (txCount > 0) {
      throw new BadRequestException(
        'Cannot delete a wallet that has transactions. Archive it instead.',
      );
    }

    await this.walletsRepo.remove(wallet);
    return { message: 'Wallet deleted successfully.' };
  }

  /** Verifies ownership without throwing — used internally */
  async assertOwnership(id: string, userId: string): Promise<Wallet> {
    const wallet = await this.walletsRepo.findOneBy({ id });
    if (!wallet) throw new NotFoundException('Wallet not found.');
    if (wallet.userId !== userId) throw new ForbiddenException('Access denied.');
    return wallet;
  }
}
