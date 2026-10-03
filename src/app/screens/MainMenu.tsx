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
      className="relative w-full h-full flex flex-col items-center justify-center bg-cover bg-center overflow-x-hidden overflow-y-auto p-4 sm:p-6"
      style={{ backgroundImage: 'url(/assets/ui_scene_background.png)' }}
    >
      {/* Sound Mute Toggle (Top Right) */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <button
          onClick={toggleSound}
          className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-amber-300 border border-amber-500/40 flex items-center justify-center text-lg shadow-lg cursor-pointer"
          aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>

      {/* Side-by-Side Dual Panels Container (matching Image 1) */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-8 max-w-5xl w-full my-auto z-10">
        {/* Left Panel: Primary Pirate Battle Menu */}
        <PiratePanel size="md" className="flex-1 max-w-[420px]">
          {/* Banner Title */}
          <div className="mb-2 flex flex-col items-center">
            <div className="px-6 py-2 bg-gradient-to-b from-[#e6b756] via-[#dfa837] to-[#80550f] rounded-2xl border-2 border-[#523307] shadow-xl transform -rotate-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-[#331c04] drop-shadow-[0_2px_3px_rgba(255,255,255,0.4)]">
                PIRATE BATTLE
              </h1>
            </div>
            <span className="text-[10px] sm:text-xs font-bold tracking-widest text-[#d5b985] uppercase mt-2">
              Set sail. Take command.
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

        {/* Right Panel: Controls & Instructions Panel (matching Image 1) */}
        <PiratePanel size="md" className="flex-1 max-w-[420px]">
          <h2 className="text-xl sm:text-2xl font-black text-[#fce79f] tracking-wider mb-4 drop-shadow-md">
            CONTROLS
          </h2>

          {/* Keybindings Table */}
          <div className="w-full flex flex-col gap-2 text-xs sm:text-sm mb-4">
            <div className="flex items-center justify-between py-1 border-b border-[#25394d]">
              <span className="text-stone-300 font-medium">Sail forward</span>
              <span className="px-2.5 py-0.5 rounded bg-black/60 border border-stone-600 font-mono text-amber-200 text-xs">
                W / ↑
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[#25394d]">
              <span className="text-stone-300 font-medium">Turn left</span>
              <span className="px-2.5 py-0.5 rounded bg-black/60 border border-stone-600 font-mono text-amber-200 text-xs">
                A / ←
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[#25394d]">
              <span className="text-stone-300 font-medium">Turn right</span>
              <span className="px-2.5 py-0.5 rounded bg-black/60 border border-stone-600 font-mono text-amber-200 text-xs">
                D / →
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[#25394d]">
              <span className="text-stone-300 font-medium">Fire bow cannon</span>
              <span className="px-2.5 py-0.5 rounded bg-black/60 border border-stone-600 font-mono text-amber-200 text-xs">
                Space / K
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[#25394d]">
              <span className="text-stone-300 font-medium">Port broadside (left)</span>
              <span className="px-2.5 py-0.5 rounded bg-black/60 border border-stone-600 font-mono text-amber-200 text-xs">
                Q / J
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[#25394d]">
              <span className="text-stone-300 font-medium">Starboard broadside (right)</span>
              <span className="px-2.5 py-0.5 rounded bg-black/60 border border-stone-600 font-mono text-amber-200 text-xs">
                E / L
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[#25394d]">
              <span className="text-stone-300 font-medium">Pause</span>
              <span className="px-2.5 py-0.5 rounded bg-black/60 border border-stone-600 font-mono text-amber-200 text-xs">
                P / Esc
              </span>
            </div>
          </div>

          {/* Touch Note */}
          <div className="w-full bg-[#122438]/80 p-3 rounded-xl border border-[#25394d]">
            <p className="text-[11px] text-[#c5ad83] text-left leading-relaxed">
              On touch screens, drag the joystick (bottom left) towards where you want to sail and use the cannon buttons (bottom right). Steering and firing work at the same time.
            </p>
          </div>
        </PiratePanel>
      </div>

      {/* Network Lab Status (Bottom Left - matching Image 1) */}
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
