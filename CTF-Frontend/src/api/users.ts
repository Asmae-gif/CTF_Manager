// src/api/users.ts
import { api } from './client';
export { messageFromAxiosError } from './auth';

// ─── Types ─────────────────────────────────────────────────────────────────
export interface UserAdmin {
  id: number;
  username: string;
  fullname?: string;
  email: string;
  avatar?: string;
  country?: string;
  type: 'admin' | ' Capitain' | 'participant';
  score: number;
  is_active: boolean;
  created_at: string;
}

export interface PaginatedUsers {
  data: UserAdmin[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

export interface TeamAdmin {
  id: number;
  name: string;
  avatar?: string;
  score: number;
  is_active: boolean;
  solved_count: number;
  members_count: number;
  leader?: { id: number; username: string };
  top_member?: { username: string; score: number };
  competition?: { id: number; title: string; status: string };
}

export interface Badge {
  emoji: string | null;
  name: string;
  slug: string;
  competition: string | null;
  placement: number;
  awarded_at: string | null;
}

export interface UserProfile {
  id: number;
  username: string;
  fullname?: string;
  email: string;
  avatar?: string;
  bio?: string;
  country?: string;
  type: string;
  score: number;
  rank: string;
  skills?: string[];
  is_active: boolean;
  last_seen_at?: string;
  created_at: string;
  badges: Badge[];
}

/** GET /user/profile — profil personnel */
export async function getMyProfile(): Promise<UserProfile> {
  const { data } = await api.get('/user/profile');
  return data;
}

/** PUT /user/profile — modifier son profil */
export async function updateMyProfile(payload: any): Promise<{ message: string }> {
  // If payload is FormData (contains avatar file), send multipart request as POST
  // because PUT multipart uploads may not be parsed consistently by PHP/Laravel.
  if (payload instanceof FormData) {
    const { data } = await api.post('/user/profile', payload);
    return data;
  }

  const { data } = await api.put('/user/profile', payload);
  return data;
}

/** GET /users/{id} — profil public d'un autre user */
export async function getPublicProfile(id: number): Promise<UserProfile> {
  const { data } = await api.get(`/users/${id}`);
  return data;
}

// ─── Users API ─────────────────────────────────────────────────────────────

/** GET /users?page=&search=&type= */
export async function getUsers(params?: {
  page?: number;
  search?: string;
  type?: string;
}): Promise<PaginatedUsers> {
  const query = new URLSearchParams();
  if (params?.page)   query.set('page',   String(params.page));
  if (params?.search) query.set('search', params.search);
  if (params?.type && params.type !== 'all') query.set('type', params.type);

  const { data } = await api.get(`/users?${query}`);
  return data;
}

/** PATCH /users/{id}/toggle — activer / désactiver */
export async function toggleUser(id: number): Promise<{ message: string; is_active: boolean }> {
  const { data } = await api.patch(`/users/${id}/toggle`);
  return data;
}

/** DELETE /users/{id} */
export async function deleteUser(id: number): Promise<{ message: string }> {
  const { data } = await api.delete(`/users/${id}`);
  return data;
}

// ─── Admin Teams API ────────────────────────────────────────────────────────

/** GET /admin/teams — liste avec stats */
export async function getAdminTeams(): Promise<TeamAdmin[]> {
  const { data } = await api.get('/admin/teams');
  return data.data ?? data;
}

/** DELETE /admin/teams/{id} */
export async function deleteAdminTeam(id: number): Promise<{ message: string }> {
  const { data } = await api.delete(`/admin/teams/${id}`);
  return data;
}