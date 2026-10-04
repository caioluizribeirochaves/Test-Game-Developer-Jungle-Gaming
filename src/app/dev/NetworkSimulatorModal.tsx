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
    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-1.5 xs:p-2 sm:p-4 select-none">
      <PiratePanel size="wide" className="z-10 max-h-[calc(100dvh-12px)] flex flex-col">
        {/* Header - Pinned */}
        <div className="w-full flex items-center justify-between mb-1 sm:mb-2 shrink-0">
          <h2 className="text-xs xs:text-sm sm:text-base md:text-lg font-black text-[#fce79f] tracking-wider flex items-center gap-1.5 truncate">
            <span>⚙️</span> Network & MSW Chaos Simulator
          </h2>
          <button
            onClick={onClose}
            className="w-6 h-6 xs:w-7 xs:h-7 rounded-full bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-500/50 flex items-center justify-center font-bold text-xs cursor-pointer shrink-0 ml-2"
            aria-label="Close Chaos Simulator"
          >
            ✕
          </button>
        </div>

        <p className="text-[8px] xs:text-[9.5px] sm:text-xs text-[#c5ad83] mb-1.5 sm:mb-2 text-left w-full shrink-0 leading-tight">
          Select network scenarios to test API resilience, TanStack Query caching, and offline outbox
          idempotent match recovery (evaluation guide item 6).
        </p>

        {/* Scrollable Center Content */}
        <div className="w-full flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-1.5 sm:gap-2">
          {/* Mode Selector - 2 columns on all devices */}
          <div className="grid grid-cols-2 gap-1 xs:gap-1.5 sm:gap-2 w-full">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => handleModeChange(m.id)}
                className={`p-1.5 xs:p-2 sm:p-2.5 rounded-lg text-left border transition-all cursor-pointer flex flex-col justify-center ${
                  config.mode === m.id
                    ? 'bg-amber-900/60 border-amber-400 text-amber-100 shadow-[0_0_8px_rgba(223,168,55,0.4)]'
                    : 'bg-[#152332] border-[#25394d] text-stone-300 hover:border-stone-400'
                }`}
              >
                <div className="text-[9px] xs:text-[10px] sm:text-xs font-bold mb-0.5 truncate w-full leading-tight">
                  {m.title}
                </div>
                <div className="text-[7.5px] xs:text-[8.5px] sm:text-[10px] text-stone-400 leading-tight line-clamp-2">
                  {m.desc}
                </div>
              </button>
            ))}
          </div>

          {/* Sluggish Latency Slider */}
          {config.mode === 'slow' && (
            <div className="w-full bg-[#152332] p-1.5 xs:p-2 rounded-lg border border-[#25394d] flex items-center justify-between gap-2 text-[9px] xs:text-[10px]">
              <span className="text-amber-200 font-semibold whitespace-nowrap">Latency:</span>
              <input
                type="range"
                min="500"
                max="5000"
                step="250"
                value={config.customLatencyMs}
                onChange={(e) => handleLatencyChange(Number(e.target.value))}
                className="flex-1 cursor-pointer accent-amber-400 h-1.5"
              />
              <span className="font-mono font-bold text-amber-300 w-14 text-right">
                {config.customLatencyMs} ms
              </span>
            </div>
          )}

          {/* Pending Outbox Queue Inspector */}
          <div className="w-full bg-[#152332] p-1.5 xs:p-2 rounded-lg border border-[#25394d] text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] xs:text-[10px] font-bold text-amber-300">
                Offline Outbox Queue ({pendingItems.length})
              </span>
              {pendingItems.length > 0 && (
                <button
                  onClick={handleSyncPendingNow}
                  className="text-[8px] xs:text-[9px] bg-emerald-700/80 hover:bg-emerald-600 px-1.5 py-0.5 rounded text-white font-bold cursor-pointer"
                >
                  Sync Now
                </button>
              )}
            </div>
            {pendingItems.length === 0 ? (
              <p className="text-[8px] xs:text-[9px] text-stone-400 italic">
                No pending matches. All records confirmed on server.
              </p>
            ) : (
              <div className="flex flex-col gap-1 max-h-16 overflow-y-auto">
                {pendingItems.map((p) => (
                  <div
                    key={p.id}
                    className="text-[8px] xs:text-[9px] bg-black/40 p-1 rounded flex justify-between items-center text-amber-100 font-mono"
                  >
                    <span>Score: {p.record.score} | Reason: {p.record.reason}</span>
                    <span className="text-stone-400 text-[8px]">Attempts: {p.attempts}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions - Pinned at bottom */}
        <div className="flex items-center justify-between gap-2 w-full pt-1.5 sm:pt-2 border-t border-[#243f5e] shrink-0 mt-1 sm:mt-1.5">
          <PirateButton
            variant="secondary"
            size="xs"
            className="w-[130px] xs:w-[155px] h-[30px] xs:h-[34px] text-[9px] xs:text-[10.5px]"
            onClick={handleResetToDefaults}
          >
            RESET DEFAULTS
          </PirateButton>

          <PirateButton
            variant="primary"
            size="xs"
            className="w-[92px] xs:w-[100px] h-[30px] xs:h-[34px] text-[9px] xs:text-[10.5px]"
            onClick={onClose}
          >
            CLOSE
          </PirateButton>
        </div>
      </PiratePanel>
    </div>
  );
};
