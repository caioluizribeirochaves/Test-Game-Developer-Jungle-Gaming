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
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden select-none">
      {/* Blurred background scene image with scale to prevent white edges */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-[2.5px] scale-105 pointer-events-none"
        style={{ backgroundImage: 'url(/assets/ui_scene_background.png)' }}
      />
      {/* Slight dark overlay for contrast */}
      <div className="absolute inset-0 bg-black/35 pointer-events-none" />

      <PiratePanel size="md" className="z-10 max-h-[calc(100dvh-20px)]">
        <h2 className="text-base xs:text-lg sm:text-2xl font-extrabold text-[#fce79f] tracking-wider mb-0.5 drop-shadow-md">
          BATTLE COMPLETE
        </h2>

        {/* Large Score Number */}
        <div className="text-3xl xs:text-4xl sm:text-6xl font-black text-[#fce79f] my-0.5 sm:my-1 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] font-mono">
          {record.score}
        </div>

        {/* Match Summary Line */}
        <div className="text-[9px] xs:text-[10px] sm:text-xs font-bold text-[#c5ad83] uppercase tracking-wider mb-1 sm:mb-2">
          POINTS • {durationFormatted} • {reasonLabel}
        </div>

        {/* Match Recording Sync Status */}
        <div className="w-full flex items-center justify-center mb-2 sm:mb-3">
          {syncStatus === 'pending' && (
            <div className="text-[10px] xs:text-[11px] sm:text-xs text-amber-300 flex items-center gap-1.5 animate-pulse">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              Recording in Captain's Log...
            </div>
          )}

          {syncStatus === 'success' && (
            <div className="text-[10px] xs:text-[11px] sm:text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <span>✓</span> Battle recorded in Captain's Logs.
            </div>
          )}

          {(syncStatus === 'offline_queued' || syncStatus === 'error') && (
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[10px] xs:text-[11px] text-amber-400">
                ⚠ Network issue. Match saved locally.
              </span>
              <button
                onClick={onRetrySync}
                className="text-[10px] xs:text-[11px] text-sky-400 underline hover:text-sky-300 cursor-pointer font-bold"
              >
                Retry Sync Now
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons (side by side on mobile for compact vertical fit) */}
        <div className="flex flex-row gap-2 sm:gap-3 w-full items-center justify-center">
          <PirateButton
            variant="primary"
            size="xs"
            onClick={onPlayAgain}
            className="w-[125px] xs:w-[145px] h-[34px] xs:h-[38px] text-[10px] xs:text-[11px]"
          >
            PLAY AGAIN
          </PirateButton>

          <PirateButton
            variant="primary"
            size="xs"
            onClick={onMainMenu}
            className="w-[125px] xs:w-[145px] h-[34px] xs:h-[38px] text-[10px] xs:text-[11px]"
          >
            MAIN MENU
          </PirateButton>
        </div>
      </PiratePanel>
    </div>
  );
};
