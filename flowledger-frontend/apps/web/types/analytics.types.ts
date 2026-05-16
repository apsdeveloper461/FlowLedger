export interface DashboardStats {
  totalBalance: number;
  totalInflow: number;
  totalOutflow: number;
  totalFees: number;
}

export interface DailyFlowPoint {
  day: string;
  inflow: number;
  outflow: number;
}

export interface SpendTagBreakdownItem {
  id: string;
  name: string;
  color: string;
  total: number;
}

export interface WalletBalanceItem {
  id: string;
  name: string;
  color: string;
  type: string;
  balance: number;
}

export interface MonthlyNetFlowPoint {
  month: string;
  inflow: number;
  outflow: number;
  net: number;
}

export interface TopSpendTagItem {
  id: string;
  name: string;
  color: string;
  total: number;
  percentage: number;
}

export interface TransferFeePoint {
  month: string;
  totalFees: number;
}

export interface AnalyticsQuery {
  dateFrom?: string;
  dateTo?: string;
  walletId?: string;
}
