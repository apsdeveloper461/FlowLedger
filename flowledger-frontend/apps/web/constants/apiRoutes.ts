// API Base URLs
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

// Auth
export const AUTH_ROUTES = {
  register: '/auth/register',
  login: '/auth/login',
  verifyOtp: '/auth/verify-otp',
  resendOtp: '/auth/resend-otp',
  forgotPassword: '/auth/forgot-password',
  verifyResetOtp: '/auth/verify-reset-otp',
  resetPassword: '/auth/reset-password',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
} as const;

// Wallets
export const WALLET_ROUTES = {
  list: '/wallets',
  detail: (id: string) => `/wallets/${id}`,
  archive: (id: string) => `/wallets/${id}/archive`,
  delete: (id: string) => `/wallets/${id}`,
} as const;

// Spend Tags
export const SPEND_TAG_ROUTES = {
  list: '/spend-tags',
  detail: (id: string) => `/spend-tags/${id}`,
} as const;

// Transactions
export const TRANSACTION_ROUTES = {
  list: '/transactions',
  export: '/transactions/export',
  inflow: '/transactions/inflow',
  outflow: '/transactions/outflow',
  transfer: '/transactions/transfer',
  detail: (id: string) => `/transactions/${id}`,
} as const;

// Analytics
export const ANALYTICS_ROUTES = {
  stats: '/analytics/stats',
  dailyFlow: '/analytics/daily-flow',
  spendTags: '/analytics/spend-tags',
  walletBalances: '/analytics/wallet-balances',
  monthlyNetFlow: '/analytics/monthly-net-flow',
  topSpendTags: '/analytics/top-spend-tags',
  transferFees: '/analytics/transfer-fees',
} as const;
