import { MatchConfig } from '@/engine/config/gameConfig';

export type EndReason = 'TIME_UP' | 'DEFEATED';

export interface MatchRecord {
  id: string; // Unique match ID / Idempotency Key (UUID)
  playerId: string;
  playerName: string;
  date: string; // ISO 8601 string
  score: number;
  duration: number; // Effective play time in seconds
  reason: EndReason;
  config: MatchConfig;
}

export interface RankingEntry {
  rank: number;
  matchId: string;
  playerId: string;
  playerName: string;
  score: number;
  duration: number;
  date: string;
  isCurrentPlayer: boolean;
  config: MatchConfig;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PendingMatchSubmission {
  id: string; // matchId
  record: MatchRecord;
  createdAt: number;
  attempts: number;
  lastAttemptAt?: number;
  error?: string;
}

export type NetworkChaosMode =
  | 'normal'
  | 'empty'
  | 'slow'
  | 'out_of_order'
  | 'http_500'
  | 'timeout'
  | 'offline';

export interface NetworkSimulatorSettings {
  mode: NetworkChaosMode;
  latencyMs: number;
  errorRate: number; // 0 to 1
}
