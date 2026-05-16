'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '../lib/axios';
import { WALLET_ROUTES } from '../constants/apiRoutes';
import { Wallet, CreateWalletPayload, UpdateWalletPayload } from '../types/wallet.types';
import { ApiResponse } from '../types/user.types';

export function useWallets() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<Wallet[]>>(WALLET_ROUTES.list);
      setWallets(res.data.data);
    } catch {
      setError('Failed to load wallets.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetch(); }, [fetch]);

  const create = useCallback(async (data: CreateWalletPayload): Promise<Wallet> => {
    const res = await api.post<ApiResponse<Wallet>>(WALLET_ROUTES.list, data);
    const wallet = res.data.data;
    setWallets((prev) => [...prev, wallet]);
    return wallet;
  }, []);

  const update = useCallback(async (id: string, data: UpdateWalletPayload): Promise<Wallet> => {
    const res = await api.patch<ApiResponse<Wallet>>(WALLET_ROUTES.detail(id), data);
    const updated = res.data.data;
    setWallets((prev) => prev.map((w) => (w.id === id ? updated : w)));
    return updated;
  }, []);

  const archive = useCallback(async (id: string): Promise<void> => {
    await api.patch(WALLET_ROUTES.archive(id));
    setWallets((prev) => prev.map((w) => (w.id === id ? { ...w, isArchived: true } : w)));
  }, []);

  const remove = useCallback(async (id: string): Promise<void> => {
    await api.delete(WALLET_ROUTES.delete(id));
    setWallets((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const activeWallets = wallets.filter((w) => !w.isArchived);
  const totalBalance = activeWallets.reduce((sum, w) => sum + w.balance, 0);

  return { wallets, activeWallets, totalBalance, loading, error, fetch, create, update, archive, remove };
}
