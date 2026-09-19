const BASE = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api`;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export type Team = "home" | "away";
export type CardColor = "yellow" | "red";
export type EventType = "goal" | "card" | "substitution";

export type SquadDto = { onField: number[]; bench: number[] };
export type LineupsDto = { home: SquadDto; away: SquadDto };

export type MatchDto = {
  id: string;
  home_team: string;
  away_team: string;
  home_color: string;
  away_color: string;
  category: string;
  half_duration_min: number;
  pair_code: string;
  lineup_enabled: boolean;
  lineups: LineupsDto | Record<string, never>;
  status: string;
  created_at: string;
  finished_at: string | null;
};

export type EventDto = {
  id: string;
  match_id: string;
  type: EventType;
  minute: number;
  added_minute: number;
  team: Team;
  dorsal: number | null;
  card_color: CardColor | null;
  dorsal_out: number | null;
  dorsal_in: number | null;
  reason: string | null;
  created_at: string;
};

export type EventInput = {
  type: EventType;
  minute: number;
  added_minute: number;
  team: Team;
  dorsal?: number;
  card_color?: CardColor;
  dorsal_out?: number;
  dorsal_in?: number;
  reason?: string;
};

export type MatchCreateInput = {
  home_team: string;
  away_team: string;
  home_color: string;
  away_color: string;
  category: string;
  half_duration_min: number;
  lineup_enabled: boolean;
  lineups: LineupsDto | Record<string, never>;
};

export const api = {
  createMatch: (body: MatchCreateInput) =>
    request<MatchDto>("/matches", { method: "POST", body: JSON.stringify(body) }),
  listMatches: (status?: string) =>
    request<MatchDto[]>(`/matches${status ? `?status=${status}` : ""}`),
  getMatch: (id: string) => request<MatchDto>(`/matches/${id}`),
  getMatchByCode: (code: string) => request<MatchDto>(`/matches/by-code/${code}`),
  finishMatch: (id: string) =>
    request<MatchDto>(`/matches/${id}/finish`, { method: "POST" }),
  getEvents: (id: string) => request<EventDto[]>(`/matches/${id}/events`),
  addEvent: (id: string, body: EventInput) =>
    request<EventDto>(`/matches/${id}/events`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
