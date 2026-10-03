import React from 'react';
import { PiratePanel } from '../components/PiratePanel';
import { PirateButton } from '../components/PirateButton';
import { MatchRecord } from '@/api/types';

export interface ResultModalProps {
  record: MatchRecord;
  syncStatus: 'idle' | 'pending' | 'success' | 'offline_queued' | 'error';
  onRetrySync: () => void;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  record,
  syncStatus,
  onRetrySync,
  onPlayAgain,
  onMainMenu,
}) => {
  const minutes = Math.floor(record.duration / 60);
  const seconds = record.duration % 60;
  const durationFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const reasonLabel = record.reason === 'TIME_UP' ? 'TIME UP' : 'DEFEATED';

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: 'url(/assets/ui_scene_background.png)' }}
    >
      <PiratePanel size="md">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#fce79f] tracking-wider mb-2 drop-shadow-md">
          BATTLE COMPLETE
        </h2>

        {/* Large Score Number */}
        <div className="text-6xl sm:text-7xl font-black text-[#fce79f] my-2 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] font-mono">
          {record.score}
        </div>

        {/* Match Summary Line */}
        <div className="text-xs sm:text-sm font-bold text-[#c5ad83] uppercase tracking-wider mb-4">
          POINTS • {durationFormatted} • {reasonLabel}
        </div>

        {/* Match Recording Sync Status */}
        <div className="w-full flex items-center justify-center mb-6">
          {syncStatus === 'pending' && (
            <div className="text-xs text-amber-300 flex items-center gap-1.5 animate-pulse">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Recording in Captain's Log...
            </div>
          )}

          {syncStatus === 'success' && (
            <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <span>✓</span> Confirmed in Captain's Log
            </div>
          )}

          {(syncStatus === 'offline_queued' || syncStatus === 'error') && (
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-amber-400">
                ⚠ Network issue. Match saved locally.
              </span>
              <button
                onClick={onRetrySync}
                className="text-xs text-sky-400 underline hover:text-sky-300 cursor-pointer font-bold"
              >
                Retry Sync Now
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full items-center">
          <PirateButton variant="primary" size="lg" onClick={onPlayAgain}>
            PLAY AGAIN
          </PirateButton>

          <PirateButton variant="primary" size="md" onClick={onMainMenu}>
            MAIN MENU
          </PirateButton>
        </div>
      </PiratePanel>
    </div>
  );
};
