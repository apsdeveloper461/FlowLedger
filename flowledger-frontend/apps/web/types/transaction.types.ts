import { TransactionTypeKey } from '../constants/transactionTypes';
import { Wallet } from './wallet.types';

export interface SpendTag {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  walletId: string;
  wallet: Wallet;
  toWalletId: string | null;
  toWallet: Wallet | null;
  spendTagId: string | null;
  spendTag: SpendTag | null;
  type: TransactionTypeKey;
  amount: number;
  sourceLabel: string | null;
  note: string | null;
  transferGroupId: string | null;
  date: string;
  createdAt: string;
}

export interface PaginatedTransactions {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
}

export interface LedgerQuery {
  type?: TransactionTypeKey;
  walletId?: string;
  spendTagId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: 'date' | 'amount';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface CreateInflowPayload {
  walletId: string;
  amount: number;
  sourceLabel?: string;
  note?: string;
  date: string;
}

export interface CreateOutflowPayload {
  walletId: string;
  spendTagId?: string;
  amount: number;
  note?: string;
  date: string;
}

export interface CreateTransferPayload {
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  fee?: number;
  note?: string;
  date: string;
}
