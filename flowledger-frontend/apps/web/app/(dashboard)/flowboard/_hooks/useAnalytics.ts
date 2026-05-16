'use client';

import { useState, useCallback } from 'react';
import api from '../../../../lib/axios';
import { ANALYTICS_ROUTES } from '../../../../constants/apiRoutes';
import {
  DashboardStats,
  DailyFlowPoint,
  SpendTagBreakdownItem,
  WalletBalanceItem,
  MonthlyNetFlowPoint,
  TopSpendTagItem,
  TransferFeePoint,
  AnalyticsQuery,
} from '../../../../types/analytics.types';
import { ApiResponse } from '../../../../types/user.types';

export function useDashboardStats(query: AnalyticsQuery = {}) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<DashboardStats>>(ANALYTICS_ROUTES.stats, { params: query });
      setStats(res.data.data);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(query)]);

  return { stats, loading, fetch };
}

export function useAnalytics(query: AnalyticsQuery = {}) {
  const [dailyFlow, setDailyFlow] = useState<DailyFlowPoint[]>([]);
  const [spendTagBreakdown, setSpendTagBreakdown] = useState<SpendTagBreakdownItem[]>([]);
  const [walletBalances, setWalletBalances] = useState<WalletBalanceItem[]>([]);
  const [monthlyNetFlow, setMonthlyNetFlow] = useState<MonthlyNetFlowPoint[]>([]);
  const [topSpendTags, setTopSpendTags] = useState<TopSpendTagItem[]>([]);
  const [transferFees, setTransferFees] = useState<TransferFeePoint[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [df, st, wb, mn, tst, tf] = await Promise.all([
        api.get<ApiResponse<DailyFlowPoint[]>>(ANALYTICS_ROUTES.dailyFlow, { params: query }),
        api.get<ApiResponse<SpendTagBreakdownItem[]>>(ANALYTICS_ROUTES.spendTags, { params: query }),
        api.get<ApiResponse<WalletBalanceItem[]>>(ANALYTICS_ROUTES.walletBalances),
        api.get<ApiResponse<MonthlyNetFlowPoint[]>>(ANALYTICS_ROUTES.monthlyNetFlow),
        api.get<ApiResponse<TopSpendTagItem[]>>(ANALYTICS_ROUTES.topSpendTags, { params: query }),
        api.get<ApiResponse<TransferFeePoint[]>>(ANALYTICS_ROUTES.transferFees),
      ]);
      setDailyFlow(df.data.data);
      setSpendTagBreakdown(st.data.data);
      setWalletBalances(wb.data.data);
      setMonthlyNetFlow(mn.data.data);
      setTopSpendTags(tst.data.data);
      setTransferFees(tf.data.data);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(query)]);

  return { dailyFlow, spendTagBreakdown, walletBalances, monthlyNetFlow, topSpendTags, transferFees, loading, fetch };
}
