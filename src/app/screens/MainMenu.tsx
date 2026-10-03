import React from 'react';
import { PiratePanel } from '../components/PiratePanel';
import { PirateButton } from '../components/PirateButton';
import { AudioManager } from '@/engine/audio/AudioManager';
import { getChaosConfig } from '@/mocks/chaosConfig';

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
  const [chaosMode, setChaosMode] = React.useState(() => getChaosConfig().mode);

  React.useEffect(() => {
    const handleChaosChange = () => {
      setChaosMode(getChaosConfig().mode);
    };
    window.addEventListener('pirate-chaos-changed', handleChaosChange);
    return () => window.removeEventListener('pirate-chaos-changed', handleChaosChange);
  }, []);

  const toggleSound = () => {
    const muted = AudioManager.getInstance().toggleMute();
    setIsMuted(muted);
  };

  const getChaosLabel = () => {
    switch (chaosMode) {
      case 'normal': return 'Normal';
      case 'empty': return 'Empty Lists';
      case 'slow': return 'Sluggish';
      case 'out_of_order': return 'Out of Order';
      case 'http_500': return 'HTTP 500';
      case 'timeout': return 'Timeout';
      case 'offline': return 'Offline';
      default: return 'Normal';
    }
  };

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center bg-cover bg-center overflow-x-hidden overflow-y-auto p-4 select-none"
      style={{ backgroundImage: 'url(/assets/ui_scene_background.png)' }}
    >
      {/* Sound Mute Toggle (Top Right) */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <button
          onClick={toggleSound}
          className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-amber-300 border border-amber-500/40 flex items-center justify-center text-lg shadow-lg cursor-pointer transition-transform active:scale-90"
          aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>

      {/* Central Authentic Pirate Menu Panel (matching media_1791050724851.png) */}
      <PiratePanel size="menu" className="my-auto z-10">
        {/* Title Plaque */}
        <div className="w-full flex flex-col items-center pt-2">
          <div className="relative w-[270px] sm:w-[300px] h-[72px] sm:h-[78px] flex items-center justify-center filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]">
            <img
              src="/assets/png/retina/ui/menu/button_primary_normal.png"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-fill pointer-events-none"
            />
            <h1 className="relative z-10 font-serif font-black tracking-widest text-2xl sm:text-3xl text-[#3d240c] uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]">
              PIRATE BATTLE
            </h1>
          </div>
          <p className="font-serif text-[10px] sm:text-[11px] font-bold tracking-[0.25em] text-[#dfa837] uppercase mt-2.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            SET SAIL. TAKE COMMAND.
          </p>
        </div>

        {/* Primary Action Buttons: PLAY & OPTIONS */}
        <div className="flex flex-col gap-3.5 my-auto w-full items-center">
          <PirateButton variant="primary" size="lg" onClick={onPlay}>
            PLAY
          </PirateButton>

          <PirateButton variant="primary" size="md" onClick={onOptions}>
            OPTIONS
          </PirateButton>
        </div>

        {/* Dinghy Illustration & Tagline */}
        <div className="flex flex-col items-center gap-2 my-1">
          <img
            src="/assets/png/retina/ships/dinghy_large_1.png"
            alt="Pirate Boat"
            className="w-7 h-11 sm:w-8 sm:h-12 object-contain filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.85)]"
          />
          <p className="font-serif text-[9.5px] sm:text-[10.5px] font-semibold tracking-wider text-[#d4bd8a] uppercase text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] max-w-[280px]">
            NAVIGATE THE ISLANDS. SURVIVE THE BATTLE.
          </p>
        </div>

        {/* Bottom Secondary Buttons: RANKING & MATCH HISTORY */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 w-full pb-2">
          <PirateButton
            variant="secondary"
            size="md"
            onClick={() => onOpenLog('ranking')}
          >
            RANKING
          </PirateButton>

          <PirateButton
            variant="secondary"
            size="md"
            onClick={() => onOpenLog('history')}
          >
            MATCH HISTORY
          </PirateButton>
        </div>
      </PiratePanel>

      {/* Network Lab Status (Bottom Left) */}
      <div className="absolute bottom-3 left-4 z-20">
        <button
          onClick={onOpenChaosSimulator}
          className="text-xs text-sky-200/80 hover:text-sky-100 flex items-center gap-1.5 cursor-pointer bg-black/40 px-2.5 py-1 rounded-full border border-sky-400/30 backdrop-blur-xs transition-colors"
          title="Open Network Chaos Simulator"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Network lab • {getChaosLabel()}</span>
        </button>
      </div>

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
