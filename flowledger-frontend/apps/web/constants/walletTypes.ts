export const WALLET_TYPES = {
  bank: { label: 'Bank Account', icon: '🏦' },
  cash: { label: 'Cash', icon: '💵' },
  mobile_wallet: { label: 'Mobile Wallet', icon: '📱' },
  other: { label: 'Other', icon: '💳' },
} as const;

export type WalletTypeKey = keyof typeof WALLET_TYPES;
