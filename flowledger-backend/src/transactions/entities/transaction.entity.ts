import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Wallet } from '../../wallets/entities/wallet.entity';
import { SpendTag } from '../../spend-tags/entities/spend-tag.entity';
import { TransactionType } from '../enums/transaction-type.enum';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  // Primary wallet (fromWallet for transfers, the wallet for inflow/outflow)
  @ManyToOne(() => Wallet, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;

  @Column({ name: 'wallet_id' })
  walletId: string;

  // Only for transfer_in records — the destination wallet
  @ManyToOne(() => Wallet, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'to_wallet_id' })
  toWallet: Wallet | null;

  @Column({ name: 'to_wallet_id', nullable: true, type: 'uuid' })
  toWalletId: string | null;

  // Only for outflow records
  @ManyToOne(() => SpendTag, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'spend_tag_id' })
  spendTag: SpendTag | null;

  @Column({ name: 'spend_tag_id', nullable: true, type: 'uuid' })
  spendTagId: string | null;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  amount: number;

  @Column({ name: 'source_label', nullable: true, type: 'varchar' })
  sourceLabel: string | null; // for inflow: e.g. "Salary", "Freelance"

  @Column({ nullable: true, type: 'varchar' })
  note: string | null;

  // Groups the transfer_out + transfer_in + transfer_fee records together
  @Column({
    name: 'transfer_group_id',
    nullable: true,
    type: 'uuid',
  })
  transferGroupId: string | null;

  @Column({ type: 'timestamptz' })
  date: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
