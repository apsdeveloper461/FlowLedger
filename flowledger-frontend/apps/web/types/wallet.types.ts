import { WalletTypeKey } from '../constants/walletTypes';

export interface Wallet {
  id: string;
  userId: string;
  name: string;
  type: WalletTypeKey;
  balance: number;
  color: string;
  isArchived: boolean;
  createdAt: string;
}

export interface CreateWalletPayload {
  name: string;
  type: WalletTypeKey;
  initialBalance?: number;
  color: string;
}

export interface UpdateWalletPayload extends Partial<CreateWalletPayload> {
  isArchived?: boolean;
}
