import { MatchRecord, PendingMatchSubmission } from './types';

const STORAGE_KEY_PENDING_QUEUE = 'pirate_battle_pending_queue_v1';
const STORAGE_KEY_LAST_RESULT = 'pirate_battle_last_result_v1';
const STORAGE_KEY_PLAYER_PROFILE = 'pirate_battle_player_profile_v1';

export interface PlayerProfile {
  id: string;
  name: string;
}

export function getPlayerProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLAYER_PROFILE);
    if (raw) return JSON.parse(raw);
  } catch {}
  const profile: PlayerProfile = {
    id: 'player_jack_001',
    name: 'Captain Jack',
  };
  return profile;
}

export function savePlayerProfile(profile: Partial<PlayerProfile>): void {
  const current = getPlayerProfile();
  const updated = { ...current, ...profile };
  try {
    localStorage.setItem(STORAGE_KEY_PLAYER_PROFILE, JSON.stringify(updated));
  } catch {}
}

export function saveLastMatchResult(record: MatchRecord): void {
  try {
    localStorage.setItem(STORAGE_KEY_LAST_RESULT, JSON.stringify(record));
  } catch (e) {
    console.error('Failed to save last match result', e);
  }
}

export function getLastMatchResult(): MatchRecord | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LAST_RESULT);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getPendingQueue(): PendingMatchSubmission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PENDING_QUEUE);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function enqueuePendingMatch(record: MatchRecord): void {
  const queue = getPendingQueue();
  // Check if already in queue by id
  const existingIndex = queue.findIndex((item) => item.id === record.id);
  if (existingIndex >= 0) {
    queue[existingIndex]!.record = record;
  } else {
    queue.push({
      id: record.id,
      record,
      createdAt: Date.now(),
      attempts: 0,
    });
  }
  try {
    localStorage.setItem(STORAGE_KEY_PENDING_QUEUE, JSON.stringify(queue));
  } catch (e) {
    console.error('Failed to update pending queue', e);
  }
}

export function dequeuePendingMatch(matchId: string): void {
  const queue = getPendingQueue().filter((item) => item.id !== matchId);
  try {
    localStorage.setItem(STORAGE_KEY_PENDING_QUEUE, JSON.stringify(queue));
  } catch (e) {
    console.error('Failed to dequeue match', e);
  }
}

export function updatePendingAttempt(matchId: string, error?: string): void {
  const queue = getPendingQueue();
  const target = queue.find((item) => item.id === matchId);
  if (target) {
    target.attempts += 1;
    target.lastAttemptAt = Date.now();
    target.error = error;
    try {
      localStorage.setItem(STORAGE_KEY_PENDING_QUEUE, JSON.stringify(queue));
    } catch {}
  }
}
