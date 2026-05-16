'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/axios';
import {
  AUTH_ROUTES,
  WALLET_ROUTES,
  SPEND_TAG_ROUTES,
} from '../constants/apiRoutes';
import { User, ApiResponse, AuthResponse } from '../types/user.types';

interface RegisterData { fullName: string; email: string; password: string }
interface LoginData { email: string; password: string }
interface VerifyOtpData { email: string; otp: string }

export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const register = useCallback(async (data: RegisterData) => {
    setLoading(true);
    setError(null);
    try {
      await api.post<ApiResponse<{ message: string }>>(AUTH_ROUTES.register, data);
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (err: unknown) {
      const message = extractError(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const login = useCallback(async (data: LoginData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<ApiResponse<AuthResponse>>(AUTH_ROUTES.login, data);
      const user = res.data.data.user;
      if (!user.isVerified) {
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
      } else {
        router.push('/flowboard');
      }
      return user;
    } catch (err: unknown) {
      const message = extractError(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const verifyOtp = useCallback(async (data: VerifyOtpData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<ApiResponse<AuthResponse>>(AUTH_ROUTES.verifyOtp, data);
      router.push('/flowboard');
      return res.data.data.user;
    } catch (err: unknown) {
      setError(extractError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const resendOtp = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.post(AUTH_ROUTES.resendOtp, { email });
    } catch (err: unknown) {
      setError(extractError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.post(AUTH_ROUTES.forgotPassword, { email });
    } catch (err: unknown) {
      setError(extractError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyResetOtp = useCallback(async (email: string, otp: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<ApiResponse<{ resetToken: string }>>(
        AUTH_ROUTES.verifyResetOtp,
        { email, otp },
      );
      return res.data.data.resetToken;
    } catch (err: unknown) {
      setError(extractError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (resetToken: string, newPassword: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.post(AUTH_ROUTES.resetPassword, { resetToken, newPassword });
      router.push('/login');
    } catch (err: unknown) {
      setError(extractError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await api.post(AUTH_ROUTES.logout);
    } finally {
      router.push('/login');
    }
  }, [router]);

  return {
    loading,
    error,
    clearError,
    register,
    login,
    verifyOtp,
    resendOtp,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    logout,
  };
}

function extractError(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const axiosErr = err as { response?: { data?: { message?: string | string[] } } };
    const msg = axiosErr.response?.data?.message;
    if (Array.isArray(msg)) return msg[0] || 'Something went wrong.';
    if (typeof msg === 'string') return msg;
  }
  return 'Something went wrong. Please try again.';
}
