import type { AxiosError } from 'axios';
import { api, setStoredToken } from './client';

export type AuthUser = {
  id: number;
  username: string;
  fullname?: string;
  email: string;
  avatar?: string;
  bio?: string;
  country?: string;
  type: string;
  score?: number;
  rank: string;
  skills?: string;
  is_active?: boolean;
  last_seen_at?: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterData = {
  username: string;
  fullname?: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export type ForgotPasswordData = {
  email: string;
};

export type ApiAuthResponse = {
  message: string;
  token: string;
  user: AuthUser;
};

export type ApiMessageResponse = {
  message: string;
};

export async function login(credentials: LoginCredentials): Promise<ApiAuthResponse> {
  const { data } = await api.post('/auth/login', credentials);
  setStoredToken(data.token);
  return data;
}

export async function register(payload: RegisterData): Promise<ApiAuthResponse> {
  const { data } = await api.post('/auth/register', payload);
  setStoredToken(data.token);
  return data;
}

export async function forgotPassword(payload: ForgotPasswordData): Promise<ApiMessageResponse> {
  const { data } = await api.post('/auth/forgot-password', payload);
  return data;
}

export async function resetPassword(body: {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>('/auth/reset-password', body);
  return data;
}

export async function logout(): Promise<ApiMessageResponse> {
  const { data } = await api.post('/auth/logout');
  setStoredToken(null);
  return data;
}

export async function me(): Promise<AuthUser> {
  const { data } = await api.get('/auth/me');
  return data;
}

export function messageFromAxiosError(error: unknown, fallback = 'Erreur inconnue.') {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const axiosError = error as AxiosError<unknown>;
  if (axiosError.response?.data && typeof axiosError.response.data === 'object') {
    const responseData = axiosError.response.data as Record<string, unknown>;
    if (typeof responseData.message === 'string') {
      return responseData.message;
    }
    if (typeof responseData.error === 'string') {
      return responseData.error;
    }
  }

  if (axiosError.message) {
    return axiosError.message;
  }

  return fallback;
}
