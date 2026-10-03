import { http, HttpResponse, delay } from 'msw';
import { MatchRecord, RankingEntry, PaginatedResponse } from '@/api/types';
import { INITIAL_FIXTURE_MATCHES } from './fixtures';
import { getChaosConfig } from './chaosConfig';
import { getPlayerProfile } from '@/api/outbox';

const STORAGE_KEY_MATCHES_DB = 'pirate_battle_db_matches_v1';

function getStoredMatches(): MatchRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MATCHES_DB);
    if (!raw) {
      const initial = [...INITIAL_FIXTURE_MATCHES];
      localStorage.setItem(STORAGE_KEY_MATCHES_DB, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [...INITIAL_FIXTURE_MATCHES];
  }
}

function saveStoredMatches(matches: MatchRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_MATCHES_DB, JSON.stringify(matches));
  } catch (e) {
    console.error('Failed to persist matches to DB', e);
  }
}

export function resetMatchesDatabase(): void {
  const initial = [...INITIAL_FIXTURE_MATCHES];
  localStorage.setItem(STORAGE_KEY_MATCHES_DB, JSON.stringify(initial));
}

let outOfOrderCounter = 0;

export const handlers = [
  // GET /api/ranking
  http.get('/api/ranking', async ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '5', 10);
    const sessionDuration = parseInt(url.searchParams.get('duration') || '120', 10);
    const enemySpawnInterval = parseInt(url.searchParams.get('spawnInterval') || '3', 10);

    const chaos = getChaosConfig();

    if (chaos.mode === 'slow') {
      await delay(chaos.customLatencyMs);
    } else if (chaos.mode === 'out_of_order') {
      outOfOrderCounter++;
      // Alternate between fast and slow to scramble responses
      await delay(outOfOrderCounter % 2 === 0 ? 1200 : 200);
    } else if (chaos.mode === 'http_500') {
      await delay(300);
      return HttpResponse.json({ message: 'Simulated 500 Internal Server Error on Ranking' }, { status: 500 });
    } else if (chaos.mode === 'timeout') {
      await delay(8000); // Trigger client-side timeout
    } else if (chaos.mode === 'offline') {
      return HttpResponse.error();
    } else {
      // Natural fast network delay
      await delay(120);
    }

    if (chaos.mode === 'empty') {
      const emptyResponse: PaginatedResponse<RankingEntry> = {
        items: [],
        total: 0,
        page: 1,
        pageSize,
        totalPages: 0,
      };
      return HttpResponse.json(emptyResponse);
    }

    const allMatches = getStoredMatches();
    const currentPlayer = getPlayerProfile();

    // Filter matches that share the same gameplay configuration snapshot
    const filtered = allMatches.filter(
      (m) =>
        m.config.sessionDuration === sessionDuration &&
        m.config.enemySpawnInterval === enemySpawnInterval
    );

    // Deterministic tie-breaker:
    // 1. Score DESC (highest score wins)
    // 2. Duration ASC (achieved faster or survived less time)
    // 3. Date ASC (first to achieve it)
    // 4. ID ASC
    const sorted = [...filtered].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.duration !== b.duration) return a.duration - b.duration;
      const dateCmp = a.date.localeCompare(b.date);
      if (dateCmp !== 0) return dateCmp;
      return a.id.localeCompare(b.id);
    });

    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (safePage - 1) * pageSize;
    const pageItems = sorted.slice(startIndex, startIndex + pageSize);

    const rankingEntries: RankingEntry[] = pageItems.map((m, index) => ({
      rank: startIndex + index + 1,
      matchId: m.id,
      playerId: m.playerId,
      playerName: m.playerName,
      score: m.score,
      duration: m.duration,
      date: m.date,
      isCurrentPlayer: m.playerId === currentPlayer.id,
      config: m.config,
    }));

    const response: PaginatedResponse<RankingEntry> = {
      items: rankingEntries,
      total,
      page: safePage,
      pageSize,
      totalPages,
    };

    return HttpResponse.json(response);
  }),

  // GET /api/history
  http.get('/api/history', async ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '5', 10);

    const chaos = getChaosConfig();

    if (chaos.mode === 'slow') {
      await delay(chaos.customLatencyMs);
    } else if (chaos.mode === 'http_500') {
      await delay(300);
      return HttpResponse.json({ message: 'Simulated 500 Internal Server Error on History' }, { status: 500 });
    } else if (chaos.mode === 'timeout') {
      await delay(8000);
    } else if (chaos.mode === 'offline') {
      return HttpResponse.error();
    } else {
      await delay(120);
    }

    if (chaos.mode === 'empty') {
      const emptyResponse: PaginatedResponse<MatchRecord> = {
        items: [],
        total: 0,
        page: 1,
        pageSize,
        totalPages: 0,
      };
      return HttpResponse.json(emptyResponse);
    }

    const currentPlayer = getPlayerProfile();
    const allMatches = getStoredMatches();

    // Filter only matches of current player
    const playerMatches = allMatches.filter((m) => m.playerId === currentPlayer.id);

    // Sort by date DESC (most recent first)
    playerMatches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const total = playerMatches.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (safePage - 1) * pageSize;
    const pageItems = playerMatches.slice(startIndex, startIndex + pageSize);

    const response: PaginatedResponse<MatchRecord> = {
      items: pageItems,
      total,
      page: safePage,
      pageSize,
      totalPages,
    };

    return HttpResponse.json(response);
  }),

  // POST /api/matches (Record a completed match)
  http.post('/api/matches', async ({ request }) => {
    const chaos = getChaosConfig();

    if (chaos.mode === 'slow') {
      await delay(chaos.customLatencyMs);
    } else if (chaos.mode === 'http_500') {
      await delay(400);
      return HttpResponse.json({ message: 'Simulated failure recording match' }, { status: 500 });
    } else if (chaos.mode === 'timeout') {
      await delay(8000);
      return HttpResponse.error();
    } else if (chaos.mode === 'offline') {
      return HttpResponse.error();
    } else {
      await delay(250);
    }

    const payload = (await request.json()) as MatchRecord;

    if (!payload || !payload.id) {
      return HttpResponse.json({ message: 'Invalid match payload or missing ID' }, { status: 400 });
    }

    const allMatches = getStoredMatches();

    // Idempotency: check if matchId already registered
    const existingIndex = allMatches.findIndex((m) => m.id === payload.id);
    if (existingIndex >= 0) {
      // Return existing without duplicating
      return HttpResponse.json(allMatches[existingIndex], { status: 200 });
    }

    // Save newly confirmed match
    allMatches.push(payload);
    saveStoredMatches(allMatches);

    return HttpResponse.json(payload, { status: 201 });
  }),

  // POST /api/reset (Reset fixtures and chaos)
  http.post('/api/reset', async () => {
    resetMatchesDatabase();
    return HttpResponse.json({ message: 'Database reset to initial fixtures' }, { status: 200 });
  }),
];
