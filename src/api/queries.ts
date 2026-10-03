import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { MatchRecord, RankingEntry, PaginatedResponse } from './types';
import {
  getPlayerProfile,
  getPendingQueue,
  dequeuePendingMatch,
  enqueuePendingMatch,
  updatePendingAttempt,
  saveLastMatchResult,
} from './outbox';

export const QUERY_KEYS = {
  ranking: (duration: number, spawnInterval: number, page: number) => [
    'ranking',
    duration,
    spawnInterval,
    page,
  ],
  history: (page: number) => ['history', page],
  pendingQueue: ['pendingQueue'],
};

// Fetch Ranking
export function useRankingQuery(
  duration: number,
  spawnInterval: number,
  page: number = 1,
  pageSize: number = 5
) {
  return useQuery<PaginatedResponse<RankingEntry>>({
    queryKey: QUERY_KEYS.ranking(duration, spawnInterval, page),
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<RankingEntry>>('/api/ranking', {
        params: {
          page,
          pageSize,
          duration,
          spawnInterval,
        },
      });
      return response.data;
    },
    staleTime: 10_000,
  });
}

// Fetch Match History
export function useMatchHistoryQuery(page: number = 1, pageSize: number = 5) {
  const player = getPlayerProfile();
  return useQuery<PaginatedResponse<MatchRecord>>({
    queryKey: QUERY_KEYS.history(page),
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<MatchRecord>>('/api/history', {
        params: {
          page,
          pageSize,
          playerId: player.id,
        },
      });
      return response.data;
    },
    staleTime: 10_000,
  });
}

// Submit a completed match with Outbox pattern & Idempotency
export function useRecordMatchMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: MatchRecord) => {
      // Save locally as last result right away
      saveLastMatchResult(record);

      try {
        const response = await apiClient.post<MatchRecord>('/api/matches', record);
        // Successfully sent, remove from pending queue if present
        dequeuePendingMatch(record.id);
        return { success: true, record: response.data, offline: false };
      } catch (err: unknown) {
        // Enqueue to offline outbox so it can be retried without losing the match
        const errMsg = err instanceof Error ? err.message : 'Network error';
        enqueuePendingMatch(record);
        updatePendingAttempt(record.id, errMsg);
        return { success: false, record, offline: true, error: errMsg };
      }
    },
    onSettled: () => {
      // Invalidate queries so ranking and history update immediately
      queryClient.invalidateQueries({ queryKey: ['ranking'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pendingQueue });
    },
  });
}

// Retrying all pending matches in outbox
export function useSyncPendingMatches() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const pending = getPendingQueue();
      let syncedCount = 0;

      for (const item of pending) {
        try {
          await apiClient.post<MatchRecord>('/api/matches', item.record);
          dequeuePendingMatch(item.id);
          syncedCount++;
        } catch (e: unknown) {
          const errMsg = e instanceof Error ? e.message : 'Retry failed';
          updatePendingAttempt(item.id, errMsg);
        }
      }

      return syncedCount;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['ranking'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pendingQueue });
    },
  });
}

// Reset database and clear caches
export function useResetDatabaseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/api/reset');
      localStorage.removeItem('pirate_battle_pending_queue_v1');
    },
    onSuccess: () => {
      queryClient.clear();
      queryClient.invalidateQueries();
    },
  });
}
