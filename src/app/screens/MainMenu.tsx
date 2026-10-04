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
  const [viewport, setViewport] = React.useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 720,
  }));

  React.useEffect(() => {
    const handleChaosChange = () => {
      setChaosMode(getChaosConfig().mode);
    };
    window.addEventListener('pirate-chaos-changed', handleChaosChange);
    return () => window.removeEventListener('pirate-chaos-changed', handleChaosChange);
  }, []);

  React.useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isLandscape = viewport.width > viewport.height;
  const isMobileLandscape = isLandscape && viewport.height <= 520;
  const isMobilePortrait = !isLandscape && viewport.width <= 600;

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
    <div className="relative w-full h-full min-h-full max-h-full flex flex-col items-center justify-center overflow-hidden p-2 sm:p-4 select-none">
      {/* Subtle darkened and slightly blurred background scene for high contrast focus */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-[2.5px] scale-105 pointer-events-none"
        style={{ backgroundImage: 'url(/assets/ui_scene_background.png)' }}
      />
      <div className="absolute inset-0 bg-black/35 pointer-events-none" />

      {/* Sound Mute Toggle (Top Right) */}
      <div className="absolute top-[max(0.6rem,env(safe-area-inset-top))] right-[max(0.75rem,env(safe-area-inset-right))] z-30 flex items-center gap-2">
        <button
          onClick={toggleSound}
          className={`${
            isMobileLandscape ? 'w-8 h-8 text-base' : 'w-9 h-9 sm:w-10 sm:h-10 text-base sm:text-lg'
          } rounded-full bg-black/60 hover:bg-black/80 text-amber-300 border border-amber-500/40 flex items-center justify-center shadow-lg cursor-pointer transition-transform active:scale-90`}
          aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>

      {/* Mobile Landscape Layout: Wide 2-Column Split to fit in compact heights (<= 520px) without scrolling */}
      {isMobileLandscape ? (
        <PiratePanel size="wide" className="my-auto z-10 max-w-[620px] max-h-[calc(100dvh-48px)] p-2 xs:p-3">
          <div className="flex flex-row items-center justify-between w-full h-full gap-3 sm:gap-5 px-1 sm:px-2">
            {/* Left Column: Title + Subtitle + Ship + Tagline */}
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <img
                src="/assets/png/retina/ui/menu/title_pirate_battle.png"
                alt="Pirate Battle"
                className="w-[180px] xs:w-[210px] h-auto object-contain filter drop-shadow-[0_3px_8px_rgba(0,0,0,0.6)]"
              />
              <p className="font-serif text-[8.5px] xs:text-[9.5px] font-bold tracking-[0.2em] text-[#dfa837] uppercase mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                SET SAIL. TAKE COMMAND.
              </p>
              <div className="flex items-center gap-2.5 mt-2 bg-black/25 px-2.5 py-1 rounded-lg border border-[#dfa837]/20">
                <img
                  src="/assets/png/retina/ships/ship_2.png"
                  alt="Player Pirate Ship"
                  className="w-7 h-11 object-contain filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.85)]"
                />
                <p className="font-serif text-[8px] xs:text-[9px] font-semibold tracking-wider text-[#d4bd8a] uppercase text-left max-w-[140px] leading-tight">
                  NAVIGATE THE ISLANDS. SURVIVE THE BATTLE.
                </p>
              </div>
            </div>

            {/* Right Column: Play, Options, Ranking & Match History */}
            <div className="flex-1 flex flex-col items-center justify-center gap-1.5 xs:gap-2">
              <PirateButton variant="primary" size="sm" onClick={onPlay} className="w-[170px] xs:w-[190px] h-[40px] xs:h-[46px]">
                PLAY
              </PirateButton>

              <PirateButton variant="primary" size="sm" onClick={onOptions} className="w-[170px] xs:w-[190px] h-[40px] xs:h-[46px]">
                OPTIONS
              </PirateButton>

              <div className="flex items-center justify-center gap-2 w-full mt-1">
                <PirateButton
                  variant="secondary"
                  size="xs"
                  onClick={() => onOpenLog('ranking')}
                  className="w-[82px] xs:w-[92px] h-[30px] xs:h-[34px] text-[8px] xs:text-[9px]"
                >
                  RANKING
                </PirateButton>

                <PirateButton
                  variant="secondary"
                  size="xs"
                  onClick={() => onOpenLog('history')}
                  className="w-[82px] xs:w-[92px] h-[30px] xs:h-[34px] text-[8px] xs:text-[9px]"
                >
                  HISTORY
                </PirateButton>
              </div>
            </div>
          </div>
        </PiratePanel>
      ) : (
        /* Portrait Mobile & Desktop Layout: Authentic Framed Vertical Plaque */
        <PiratePanel size="menu" className="my-auto z-10">
          {/* Authentic Pirate Battle Title Asset */}
          <div className="w-full flex flex-col items-center pt-1 sm:pt-2">
            <img
              src="/assets/png/retina/ui/menu/title_pirate_battle.png"
              alt="Pirate Battle"
              className="w-[210px] xs:w-[250px] sm:w-[320px] max-w-[90%] h-auto object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]"
            />
            <p className="font-serif text-[9px] xs:text-[10px] sm:text-[11px] font-bold tracking-[0.25em] text-[#dfa837] uppercase mt-0.5 sm:mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              SET SAIL. TAKE COMMAND.
            </p>
          </div>

          {/* Primary Action Buttons: PLAY & OPTIONS */}
          <div className="flex flex-col gap-2 xs:gap-3 sm:gap-3.5 my-2 sm:my-auto w-full items-center">
            <PirateButton
              variant="primary"
              size={isMobilePortrait ? 'md' : 'lg'}
              onClick={onPlay}
            >
              PLAY
            </PirateButton>

            <PirateButton
              variant="primary"
              size={isMobilePortrait ? 'md' : 'lg'}
              onClick={onOptions}
            >
              OPTIONS
            </PirateButton>
          </div>

          {/* Player Ship Illustration & Tagline */}
          <div className="flex flex-col items-center gap-1 sm:gap-2 my-1">
            <img
              src="/assets/png/retina/ships/ship_2.png"
              alt="Player Pirate Ship"
              className="w-7 h-11 xs:w-8 xs:h-13 sm:w-10 sm:h-16 object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.85)]"
            />
            <p className="font-serif text-[8.5px] xs:text-[9.5px] sm:text-[10.5px] font-semibold tracking-wider text-[#d4bd8a] uppercase text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] max-w-[280px]">
              NAVIGATE THE ISLANDS. SURVIVE THE BATTLE.
            </p>
          </div>

          {/* Bottom Secondary Buttons: RANKING & MATCH HISTORY */}
          <div className="flex items-center justify-center gap-2 xs:gap-3 sm:gap-4 w-full pb-1 sm:pb-2">
            <PirateButton
              variant="secondary"
              size={isMobilePortrait ? 'sm' : 'md'}
              onClick={() => onOpenLog('ranking')}
            >
              RANKING
            </PirateButton>

            <PirateButton
              variant="secondary"
              size={isMobilePortrait ? 'sm' : 'md'}
              onClick={() => onOpenLog('history')}
            >
              MATCH HISTORY
            </PirateButton>
          </div>
        </PiratePanel>
      )}

      {/* Network Lab Status (Bottom Left) - With Safe Area Padding */}
      <div className="absolute bottom-[max(0.6rem,env(safe-area-inset-bottom))] left-[max(0.75rem,env(safe-area-inset-left))] z-20">
        <button
          onClick={onOpenChaosSimulator}
          className="text-[10px] xs:text-xs text-sky-200/80 hover:text-sky-100 flex items-center gap-1.5 cursor-pointer bg-black/40 px-2 xs:px-2.5 py-0.5 xs:py-1 rounded-full border border-sky-400/30 backdrop-blur-xs transition-colors"
          title="Open Network Chaos Simulator"
        >
          <span className="w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full bg-emerald-400" />
          <span>Network lab • {getChaosLabel()}</span>
        </button>
      </div>

      {/* Jungle Gaming Branding Logo (Bottom Right) - With Safe Area Padding */}
      <div className="absolute bottom-[max(0.6rem,env(safe-area-inset-bottom))] right-[max(0.75rem,env(safe-area-inset-right))] z-20 flex items-center pointer-events-none opacity-90">
        <img
          src="/assets/logo_jungle_gaming.svg"
          alt="Jungle Gaming"
          className="h-7 xs:h-8 sm:h-11 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
        />
      </div>
    </div>
  );
};
