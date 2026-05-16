import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Transaction } from './entities/transaction.entity';
import { Wallet } from '../wallets/entities/wallet.entity';
import { TransactionType } from './enums/transaction-type.enum';
import { CreateInflowDto } from './dto/inflow.dto';
import { CreateOutflowDto } from './dto/outflow.dto';
import { CreateTransferDto } from './dto/transfer.dto';
import { LedgerQueryDto } from './dto/ledger-query.dto';

const PAGE_SIZE = 20;

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  // ─── Inflow ──────────────────────────────────────────────────────────────

  async createInflow(userId: string, dto: CreateInflowDto): Promise<Transaction> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const wallet = await qr.manager.findOneBy(Wallet, {
        id: dto.walletId,
        userId,
      });
      if (!wallet) throw new NotFoundException('Wallet not found.');
      if (wallet.isArchived) throw new BadRequestException('Wallet is archived.');

      const tx = qr.manager.create(Transaction, {
        userId,
        walletId: dto.walletId,
        type: TransactionType.INFLOW,
        amount: dto.amount,
        sourceLabel: dto.sourceLabel ?? null,
        note: dto.note ?? null,
        date: new Date(dto.date),
      });
      await qr.manager.save(tx);

      await qr.manager
        .createQueryBuilder()
        .update(Wallet)
        .set({ balance: () => `balance + ${dto.amount}` })
        .where('id = :id', { id: wallet.id })
        .execute();

      await qr.commitTransaction();
      return tx;
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  // ─── Outflow ─────────────────────────────────────────────────────────────

  async createOutflow(userId: string, dto: CreateOutflowDto): Promise<Transaction> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const wallet = await qr.manager.findOneBy(Wallet, {
        id: dto.walletId,
        userId,
      });
      if (!wallet) throw new NotFoundException('Wallet not found.');
      if (wallet.isArchived) throw new BadRequestException('Wallet is archived.');
      if (wallet.balance < dto.amount) {
        throw new BadRequestException('Insufficient wallet balance.');
      }

      const tx = qr.manager.create(Transaction, {
        userId,
        walletId: dto.walletId,
        spendTagId: dto.spendTagId ?? null,
        type: TransactionType.OUTFLOW,
        amount: dto.amount,
        note: dto.note ?? null,
        date: new Date(dto.date),
      });
      await qr.manager.save(tx);

      await qr.manager
        .createQueryBuilder()
        .update(Wallet)
        .set({ balance: () => `balance - ${dto.amount}` })
        .where('id = :id', { id: wallet.id })
        .execute();

      await qr.commitTransaction();
      return tx;
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  // ─── Fund Transfer ────────────────────────────────────────────────────────

  async createTransfer(userId: string, dto: CreateTransferDto): Promise<Transaction[]> {
    if (dto.fromWalletId === dto.toWalletId) {
      throw new BadRequestException('Cannot transfer to the same wallet.');
    }

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const [fromWallet, toWallet] = await Promise.all([
        qr.manager.findOneBy(Wallet, { id: dto.fromWalletId, userId }),
        qr.manager.findOneBy(Wallet, { id: dto.toWalletId, userId }),
      ]);

      if (!fromWallet) throw new NotFoundException('Source wallet not found.');
      if (!toWallet) throw new NotFoundException('Destination wallet not found.');
      if (fromWallet.isArchived) throw new BadRequestException('Source wallet is archived.');
      if (toWallet.isArchived) throw new BadRequestException('Destination wallet is archived.');

      const fee = dto.fee ?? 0;
      const totalDebit = dto.amount + fee;

      if (fromWallet.balance < totalDebit) {
        throw new BadRequestException('Insufficient balance (including transfer fee).');
      }

      const transferGroupId = uuidv4();
      const txDate = new Date(dto.date);
      const records: Transaction[] = [];

      // transfer_out
      const txOut = qr.manager.create(Transaction, {
        userId,
        walletId: dto.fromWalletId,
        toWalletId: dto.toWalletId,
        type: TransactionType.TRANSFER_OUT,
        amount: dto.amount + fee,
        note: dto.note ?? null,
        transferGroupId,
        date: txDate,
      });
      records.push(await qr.manager.save(txOut));

      // transfer_in
      const txIn = qr.manager.create(Transaction, {
        userId,
        walletId: dto.toWalletId,
        toWalletId: dto.fromWalletId,
        type: TransactionType.TRANSFER_IN,
        amount: dto.amount,
        note: dto.note ?? null,
        transferGroupId,
        date: txDate,
      });
      records.push(await qr.manager.save(txIn));

      // transfer_fee (only if fee > 0)
      if (fee > 0) {
        const txFee = qr.manager.create(Transaction, {
          userId,
          walletId: dto.fromWalletId,
          type: TransactionType.TRANSFER_FEE,
          amount: fee,
          note: `Transfer fee`,
          transferGroupId,
          date: txDate,
        });
        records.push(await qr.manager.save(txFee));
      }

      // Update balances
      await qr.manager
        .createQueryBuilder()
        .update(Wallet)
        .set({ balance: () => `balance - ${totalDebit}` })
        .where('id = :id', { id: fromWallet.id })
        .execute();

      await qr.manager
        .createQueryBuilder()
        .update(Wallet)
        .set({ balance: () => `balance + ${dto.amount}` })
        .where('id = :id', { id: toWallet.id })
        .execute();

      await qr.commitTransaction();
      return records;
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  // ─── Ledger (paginated list) ──────────────────────────────────────────────

  async getLedger(
    userId: string,
    query: LedgerQueryDto,
  ): Promise<{ data: Transaction[]; total: number; page: number; limit: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? PAGE_SIZE;
    const sortBy = query.sortBy ?? 'date';
    const sortOrder = query.sortOrder ?? 'DESC';

    const qb = this.txRepo
      .createQueryBuilder('tx')
      .leftJoinAndSelect('tx.wallet', 'wallet')
      .leftJoinAndSelect('tx.toWallet', 'toWallet')
      .leftJoinAndSelect('tx.spendTag', 'spendTag')
      .where('tx.userId = :userId', { userId });

    if (query.type) {
      qb.andWhere('tx.type = :type', { type: query.type });
    }
    if (query.walletId) {
      qb.andWhere('(tx.walletId = :wId OR tx.toWalletId = :wId)', { wId: query.walletId });
    }
    if (query.spendTagId) {
      qb.andWhere('tx.spendTagId = :stId', { stId: query.spendTagId });
    }
    if (query.dateFrom) {
      qb.andWhere('tx.date >= :dateFrom', { dateFrom: query.dateFrom });
    }
    if (query.dateTo) {
      qb.andWhere('tx.date <= :dateTo', { dateTo: query.dateTo });
    }
    if (query.search) {
      qb.andWhere('tx.note ILIKE :search', { search: `%${query.search}%` });
    }

    qb.orderBy(`tx.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  // ─── CSV Export ───────────────────────────────────────────────────────────

  async exportCsv(userId: string, query: LedgerQueryDto): Promise<string> {
    // Fetch all matching rows without pagination
    const { data } = await this.getLedger(userId, {
      ...query,
      page: 1,
      limit: 50000,
    });

    const header = 'Date,Type,Amount,Wallet,To Wallet,Spend Tag,Source Label,Note\n';
    const rows = data.map((tx) =>
      [
        new Date(tx.date).toISOString().split('T')[0],
        tx.type,
        tx.amount.toFixed(2),
        tx.wallet?.name ?? '',
        tx.toWallet?.name ?? '',
        tx.spendTag?.name ?? '',
        tx.sourceLabel ?? '',
        (tx.note ?? '').replace(/,/g, ';'),
      ].join(','),
    );

    return header + rows.join('\n');
  }

  // ─── Single transaction ───────────────────────────────────────────────────

  async findOne(id: string, userId: string): Promise<Transaction> {
    const tx = await this.txRepo.findOne({
      where: { id, userId },
      relations: ['wallet', 'toWallet', 'spendTag'],
    });
    if (!tx) throw new NotFoundException('Transaction not found.');
    return tx;
  }
}
