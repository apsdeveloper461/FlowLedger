'use client';

import { useState, useCallback } from 'react';
import api from '../lib/axios';
import { TRANSACTION_ROUTES } from '../constants/apiRoutes';
import {
  Transaction,
  PaginatedTransactions,
  LedgerQuery,
  CreateInflowPayload,
  CreateOutflowPayload,
  CreateTransferPayload,
} from '../types/transaction.types';
import { ApiResponse } from '../types/user.types';

export function useTransactions() {
  const [ledger, setLedger] = useState<PaginatedTransactions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLedger = useCallback(async (query: LedgerQuery = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<PaginatedTransactions>>(
        TRANSACTION_ROUTES.list,
        { params: query },
      );
      setLedger(res.data.data);
    } catch {
      setError('Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  }, []);

  const createInflow = useCallback(async (data: CreateInflowPayload): Promise<Transaction> => {
    const res = await api.post<ApiResponse<Transaction>>(TRANSACTION_ROUTES.inflow, data);
    return res.data.data;
  }, []);

  const createOutflow = useCallback(async (data: CreateOutflowPayload): Promise<Transaction> => {
    const res = await api.post<ApiResponse<Transaction>>(TRANSACTION_ROUTES.outflow, data);
    return res.data.data;
  }, []);

  const createTransfer = useCallback(async (data: CreateTransferPayload): Promise<Transaction[]> => {
    const res = await api.post<ApiResponse<Transaction[]>>(TRANSACTION_ROUTES.transfer, data);
    return res.data.data;
  }, []);

  const exportCsv = useCallback(async (query: LedgerQuery = {}): Promise<void> => {
    const res = await api.get(TRANSACTION_ROUTES.export, {
      params: query,
      responseType: 'blob',
    });
    const url = URL.createObjectURL(res.data as Blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowledger-export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return { ledger, loading, error, fetchLedger, createInflow, createOutflow, createTransfer, exportCsv };
}
