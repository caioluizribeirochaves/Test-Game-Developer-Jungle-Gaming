import { NetworkChaosMode } from '@/api/types';

const STORAGE_KEY_CHAOS = 'pirate_battle_chaos_config_v1';

export interface ChaosConfigState {
  mode: NetworkChaosMode;
  customLatencyMs: number;
}

const DEFAULT_CHAOS_STATE: ChaosConfigState = {
  mode: 'normal',
  customLatencyMs: 1500,
};

export function getChaosConfig(): ChaosConfigState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHAOS);
    if (!raw) return { ...DEFAULT_CHAOS_STATE };
    return JSON.parse(raw);
  } catch {
    return { ...DEFAULT_CHAOS_STATE };
  }
}

export function setChaosConfig(config: Partial<ChaosConfigState>): void {
  const current = getChaosConfig();
  const updated: ChaosConfigState = {
    ...current,
    ...config,
  };
  try {
    localStorage.setItem(STORAGE_KEY_CHAOS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save chaos config', e);
  }
  // Dispatch custom window event so listeners (like the chaos panel) update immediately
  window.dispatchEvent(new CustomEvent('pirate-chaos-changed', { detail: updated }));
}

export function resetChaosConfig(): void {
  setChaosConfig(DEFAULT_CHAOS_STATE);
}
