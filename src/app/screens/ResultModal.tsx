import React from 'react';
import { PiratePanel } from '../components/PiratePanel';
import { PirateButton } from '../components/PirateButton';
import { MatchRecord } from '@/api/types';

import { useDeviceLayout } from '../hooks/useDeviceLayout';

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
  const { isDesktop } = useDeviceLayout();
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
        <h2 className={`${isDesktop ? 'text-2xl sm:text-3xl mb-1' : 'text-base xs:text-lg mb-0.5'} font-extrabold text-[#fce79f] tracking-wider drop-shadow-md text-center`}>
          BATTLE COMPLETE
        </h2>

        {/* Large Score Number */}
        <div className={`${isDesktop ? 'text-5xl sm:text-6xl my-2' : 'text-3xl xs:text-4xl my-0.5 sm:my-1'} font-black text-[#fce79f] drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] font-mono text-center`}>
          {record.score}
        </div>

        {/* Match Summary Line */}
        <div className={`${isDesktop ? 'text-xs sm:text-sm mb-3' : 'text-[9px] xs:text-[10px] mb-1 sm:mb-2'} font-bold text-[#c5ad83] uppercase tracking-wider text-center`}>
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

        {/* Action Buttons */}
        <div className={`flex flex-row ${isDesktop ? 'gap-4 sm:gap-6 mt-2' : 'gap-2 sm:gap-3'} w-full items-center justify-center`}>
          <PirateButton
            variant="primary"
            size={isDesktop ? 'sm' : 'xs'}
            onClick={onPlayAgain}
            className={isDesktop ? 'w-[160px] sm:w-[175px] h-[44px] sm:h-[48px] text-xs sm:text-sm' : 'w-[125px] xs:w-[145px] h-[34px] xs:h-[38px] text-[10px] xs:text-[11px]'}
          >
            PLAY AGAIN
          </PirateButton>

          <PirateButton
            variant="primary"
            size={isDesktop ? 'sm' : 'xs'}
            onClick={onMainMenu}
            className={isDesktop ? 'w-[160px] sm:w-[175px] h-[44px] sm:h-[48px] text-xs sm:text-sm' : 'w-[125px] xs:w-[145px] h-[34px] xs:h-[38px] text-[10px] xs:text-[11px]'}
          >
            MAIN MENU
          </PirateButton>
        </div>
      </PiratePanel>
    </div>
  );
};
