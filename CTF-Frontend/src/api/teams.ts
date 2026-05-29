import { api } from './client';
export { messageFromAxiosError } from './auth';

// ── Types ─────────────────────────────────────────────────────────────────
 
export interface TeamMember {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  pivot: {
    role: 'leader' | 'member';
    joined_at: string;
  };
}
 
export interface Team {
  id: number;
  name: string;
  slug: string;
  invite_code?: string; // masqué si non-membre
  description?: string;
  avatar?: string;
  leader_id: number;
  competition_id?: number;
  score: number;
  is_active: boolean;
  created_at: string;
  leader: { id: number; name: string; email: string };
  members: TeamMember[];
  competition?: { id: number; name: string; status: string };
}
 
export interface CreateTeamPayload {
  name: string;
  description?: string;
  avatar?: string;
}
 
// ── API calls ──────────────────────────────────────────────────────────────
 
/** Créer une équipe (team_leader uniquement) */
export async function createTeam(payload: CreateTeamPayload): Promise<Team> {
  const { data } = await api.post('/teams', payload);
  return data;
}
 
/** Voir le profil d'une équipe */
export async function getTeam(teamId: number): Promise<Team> {
  const { data } = await api.get(`/teams/${teamId}`);
  return data;
}
 
/** Modifier une équipe (leader ou admin) */
export async function updateTeam(
  teamId: number,
  payload: Partial<CreateTeamPayload>
): Promise<Team> {
  const { data } = await api.put(`/teams/${teamId}`, payload);
  return data;
}
 
/** Supprimer une équipe */
export async function deleteTeam(teamId: number): Promise<void> {
  await api.delete(`/teams/${teamId}`);
}
 
/** Inviter un participant par user_id (ancien) */
export async function inviteMember(
  teamId: number,
  userId: number
): Promise<{ message: string }> {
  const { data } = await api.post(`/teams/${teamId}/invite`, { user_id: userId });
  return data;
}

/** Inviter un participant par username */
export async function inviteMemberByUsername(
  teamId: number,
  username: string
): Promise<{ message: string }> {
  const { data } = await api.post(`/teams/${teamId}/invite`, { username });
  return data;
}
 
/** Rejoindre une équipe via invite_code */
export async function joinTeam(
  inviteCode: string
): Promise<{ message: string; team: Team }> {
  const { data } = await api.post('/teams/join', { invite_code: inviteCode });
  return data;
}
 
/** Retirer un membre */
export async function removeMember(
  teamId: number,
  userId: number
): Promise<{ message: string }> {
  const { data } = await api.delete(`/teams/${teamId}/members/${userId}`);
  return data;
}
// dans src/api/teams.ts — ajoute cette fonction
export async function getTeams(): Promise<Team[]> {
    const { data } = await api.get('/teams');
    return data.data ?? data;
}