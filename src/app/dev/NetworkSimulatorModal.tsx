import React from 'react';
import { PiratePanel } from '../components/PiratePanel';
import { PirateButton } from '../components/PirateButton';
import {
  getChaosConfig,
  setChaosConfig,
  resetChaosConfig,
  ChaosConfigState,
} from '@/mocks/chaosConfig';
import { NetworkChaosMode } from '@/api/types';
import { useResetDatabaseMutation, useSyncPendingMatches } from '@/api/queries';
import { getPendingQueue } from '@/api/outbox';

export interface NetworkSimulatorModalProps {
  onClose: () => void;
}

export const NetworkSimulatorModal: React.FC<NetworkSimulatorModalProps> = ({ onClose }) => {
  const [config, setConfig] = React.useState<ChaosConfigState>(getChaosConfig);
  const resetDbMutation = useResetDatabaseMutation();
  const syncPendingMutation = useSyncPendingMatches();
  const [pendingItems, setPendingItems] = React.useState(() => getPendingQueue());

  const refreshPending = () => setPendingItems(getPendingQueue());

  const handleModeChange = (mode: NetworkChaosMode) => {
    setChaosConfig({ mode });
    setConfig(getChaosConfig());
  };

  const handleLatencyChange = (ms: number) => {
    setChaosConfig({ customLatencyMs: ms });
    setConfig(getChaosConfig());
  };

  const handleResetToDefaults = () => {
    resetChaosConfig();
    resetDbMutation.mutate();
    setConfig(getChaosConfig());
    refreshPending();
  };

  const handleSyncPendingNow = () => {
    syncPendingMutation.mutate(undefined, {
      onSettled: () => refreshPending(),
    });
  };

  const modes: { id: NetworkChaosMode; title: string; desc: string }[] = [
    {
      id: 'normal',
      title: '🟢 Normal (Success)',
      desc: 'Real fast network delay (~120ms). Normal API operations.',
    },
    {
      id: 'empty',
      title: '⚪ Empty Lists',
      desc: 'Simulates empty tables for ranking and match history.',
    },
    {
      id: 'slow',
      title: '⏳ Sluggish / High Latency',
      desc: 'Simulates slow 2G/3G network with configurable delay.',
    },
    {
      id: 'out_of_order',
      title: '🔀 Out of Order Responses',
      desc: 'Alternates fast and slow delays to test race condition handling.',
    },
    {
      id: 'http_500',
      title: '🔴 HTTP 500 Internal Error',
      desc: 'Returns HTTP 500 on all ranking, history and match submissions.',
    },
    {
      id: 'timeout',
      title: '⏱️ Request Timeout',
      desc: 'Long delay (>8s) triggering client timeout and offline queuing.',
    },
    {
      id: 'offline',
      title: '🚫 Network Disconnected',
      desc: 'Simulates drop / offline state. Queues matches in offline outbox.',
    },
  ];

  return (
    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <PiratePanel size="wide">
        <div className="w-full flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-black text-[#fce79f] tracking-wider flex items-center gap-2">
            <span>⚙️</span> Network & MSW Chaos Simulator
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-500/50 flex items-center justify-center font-bold text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-[#c5ad83] mb-4 text-left w-full">
          Select network scenarios to test API resilience, TanStack Query caching, and offline outbox
          idempotent match recovery (as specified in Item 6 of the evaluation guide).
        </p>

        {/* Mode Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full mb-4">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => handleModeChange(m.id)}
              className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                config.mode === m.id
                  ? 'bg-amber-900/50 border-amber-400 text-amber-100 shadow-[0_0_12px_rgba(223,168,55,0.4)]'
                  : 'bg-[#152332] border-[#25394d] text-stone-300 hover:border-stone-400'
              }`}
            >
              <div className="text-xs font-bold mb-0.5">{m.title}</div>
              <div className="text-[10px] text-stone-400">{m.desc}</div>
            </button>
          ))}
        </div>

        {/* Sluggish Latency Slider */}
        {config.mode === 'slow' && (
          <div className="w-full bg-[#152332] p-3 rounded-xl border border-[#25394d] mb-4 flex items-center justify-between gap-4">
            <span className="text-xs text-amber-200 font-semibold">Configured Latency:</span>
            <input
              type="range"
              min="500"
              max="5000"
              step="250"
              value={config.customLatencyMs}
              onChange={(e) => handleLatencyChange(Number(e.target.value))}
              className="flex-1 cursor-pointer accent-amber-400"
            />
            <span className="text-xs font-mono font-bold text-amber-300 w-16 text-right">
              {config.customLatencyMs} ms
            </span>
          </div>
        )}

        {/* Pending Outbox Queue Inspector */}
        <div className="w-full bg-[#152332] p-3 rounded-xl border border-[#25394d] mb-4 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-300">
              Offline Pending Outbox Queue ({pendingItems.length})
            </span>
            {pendingItems.length > 0 && (
              <button
                onClick={handleSyncPendingNow}
                className="text-[11px] bg-emerald-700/80 hover:bg-emerald-600 px-2 py-0.5 rounded text-white font-bold cursor-pointer"
              >
                Sync All Pending Now
              </button>
            )}
          </div>
          {pendingItems.length === 0 ? (
            <p className="text-[11px] text-stone-400 italic">
              No pending matches. All matches were successfully confirmed on the simulated server.
            </p>
          ) : (
            <div className="flex flex-col gap-1 max-h-24 overflow-y-auto">
              {pendingItems.map((p) => (
                <div
                  key={p.id}
                  className="text-[10px] bg-black/40 p-1.5 rounded flex justify-between items-center text-amber-100 font-mono"
                >
                  <span>Score: {p.record.score} | Reason: {p.record.reason}</span>
                  <span className="text-stone-400 text-[9px]">Attempts: {p.attempts}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reset Actions */}
        <div className="flex items-center justify-between w-full pt-2 border-t border-[#243f5e]">
          <button
            onClick={handleResetToDefaults}
            className="text-xs text-red-300 hover:text-red-200 underline cursor-pointer"
          >
            Reset DB & Restore Default Fixtures
          </button>

          <PirateButton variant="primary" size="sm" onClick={onClose}>
            CLOSE SIMULATOR
          </PirateButton>
        </div>
      </PiratePanel>
    </div>
  );
};
