import React from 'react';
import { PiratePanel } from '../components/PiratePanel';
import { PirateButton } from '../components/PirateButton';
import { AudioManager } from '@/engine/audio/AudioManager';

export interface MainMenuProps {
  onPlay: () => void;
  onOptions: () => void;
  onOpenLog: (initialTab: 'ranking' | 'history') => void;
  onOpenChaosSimulator?: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onPlay,
  onOptions,
  onOpenLog,
  onOpenChaosSimulator,
}) => {
  const [isMuted, setIsMuted] = React.useState(() => AudioManager.getInstance().getMuted());

  const toggleSound = () => {
    const muted = AudioManager.getInstance().toggleMute();
    setIsMuted(muted);
  };

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: 'url(/assets/ui_scene_background.png)' }}
    >
      {/* Sound Mute Toggle (Top Right) */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        {onOpenChaosSimulator && (
          <button
            onClick={onOpenChaosSimulator}
            className="px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-xs font-mono text-amber-300 border border-amber-500/40 backdrop-blur-xs flex items-center gap-1 cursor-pointer transition-all"
            title="Network & Mocks Chaos Simulator (Playwright / Evaluation)"
          >
            ⚙️ <span className="hidden sm:inline">Network Simulator</span>
          </button>
        )}
        <button
          onClick={toggleSound}
          className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-amber-300 border border-amber-500/40 flex items-center justify-center text-lg shadow-lg cursor-pointer"
          aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>

      {/* Center Wood Panel */}
      <PiratePanel size="md">
        {/* Banner Title */}
        <div className="mb-2 flex flex-col items-center">
          <div className="px-6 py-2 bg-gradient-to-b from-[#e6b756] via-[#dfa837] to-[#80550f] rounded-2xl border-2 border-[#523307] shadow-xl transform -rotate-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wider text-[#331c04] drop-shadow-[0_2px_3px_rgba(255,255,255,0.4)]">
              PIRATE BATTLE
            </h1>
          </div>
          <span className="text-[11px] sm:text-xs font-bold tracking-widest text-[#d5b985] uppercase mt-2">
            Set Sail. Take Command.
          </span>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col gap-3 my-4 w-full items-center">
          <PirateButton variant="primary" size="lg" onClick={onPlay}>
            PLAY
          </PirateButton>

          <PirateButton variant="primary" size="md" onClick={onOptions}>
            OPTIONS
          </PirateButton>
        </div>

        {/* Small Pirate Dinghy Illustration */}
        <div className="my-2 flex flex-col items-center">
          <div className="w-10 h-14 relative flex items-center justify-center">
            <img
              src="/assets/png/default/ships/dinghy_large_1.png"
              alt="Pirate Ship"
              className="w-8 h-12 object-contain filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]"
            />
          </div>
          <p className="text-[11px] text-[#c5ad83] text-center font-medium mt-1">
            Navigate the islands. Survive the battle.
          </p>
        </div>

        {/* Bottom Secondary Buttons: Ranking and Match History */}
        <div className="flex items-center gap-3 mt-4 w-full justify-center">
          <PirateButton
            variant="secondary"
            size="sm"
            onClick={() => onOpenLog('ranking')}
          >
            RANKING
          </PirateButton>

          <PirateButton
            variant="secondary"
            size="sm"
            onClick={() => onOpenLog('history')}
          >
            MATCH HISTORY
          </PirateButton>
        </div>
      </PiratePanel>

      {/* Jungle Gaming Branding Logo (Bottom Right) */}
      <div className="absolute bottom-3 right-4 z-20 flex items-center pointer-events-none opacity-90">
        <img
          src="/assets/logo_jungle_gaming.svg"
          alt="Jungle Gaming"
          className="h-9 sm:h-11 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
        />
      </div>
    </div>
  );
};
