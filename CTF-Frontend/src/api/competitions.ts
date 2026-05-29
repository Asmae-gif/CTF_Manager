// src/api/competitions.ts
import { api } from './client';

export type Competition = {
    id: string;
    title: string;
    description: string;
    status: string;
    starts_at: string;
    ends_at: string;
     max_teams?: number;
  max_team_members?: number;
  is_public: boolean;
  banner?: string;
  organizer_name?: string;
  first_place_prize?: string;
  second_place_prize?: string;
  third_place_prize?: string;
  finalized_at?: string;
  challenges_count: number;
    team_competition_id?: string | null;
    team_registered_here?: boolean;
    can_join?: boolean;
};

export type Challenge = {
    id: string;
    title: string;
    description: string;
    category: string;
    points: number;
    difficulty: string;
    solved: boolean;
    file_path?: string | null;
    hints_count?: number;
};

export async function getCompetitions(): Promise<Competition[]> {
    const { data } = await api.get('/competitions');
    return data.data ?? data;
}

export async function getCompetition(id: string): Promise<Competition> {
    const { data } = await api.get(`/competitions/${id}`);
    return data;
}

export async function getCompetitionChallenges(id: string): Promise<Challenge[]> {
    const { data } = await api.get(`/competitions/${id}/challenges`);
    return data.data ?? data;
}

export async function joinCompetition(id: string): Promise<void> {
    await api.post(`/competitions/${id}/join`);
}