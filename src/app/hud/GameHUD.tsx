import React from 'react';
import { PlayerInputState } from '@/engine/entities/PlayerShip';

export interface GameHUDProps {
  health: number;
  maxHealth: number;
  score: number;
  timeRemaining: number;
  onTogglePause: () => void;
  onVirtualInput: (action: keyof PlayerInputState, value: boolean) => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  health,
  maxHealth,
  score,
  timeRemaining,
  onTogglePause,
  onVirtualInput,
}) => {
  // Format remaining seconds to MM:SS
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const healthPercent = Math.max(0, Math.min(100, Math.round((health / maxHealth) * 100)));

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3 sm:p-6 overflow-hidden select-none">
      {/* Top Header Bar */}
      <div className="w-full flex items-start justify-between">
        {/* Top-Left: Health Bar with Heart Icon */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Heart Badge */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-b from-[#e6b756] to-[#80550f] border-2 border-[#4a2e07] shadow-lg flex items-center justify-center -mr-3 z-10">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-[#c0392b] drop-shadow-md"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>

          {/* Wooden Health Frame */}
          <div className="relative w-44 sm:w-60 h-8 sm:h-10 bg-gradient-to-b from-[#5c3710] to-[#381f06] border-2 border-[#9b6f1e] rounded-xl shadow-lg p-1 flex items-center">
            {/* Health Fill */}
            <div className="w-full h-full bg-[#152332] rounded-lg overflow-hidden relative border border-[#2b3a4a]">
              <div
                className={`h-full transition-all duration-200 rounded-sm ${
                  healthPercent > 50
                    ? 'bg-gradient-to-r from-[#2ecc71] to-[#27ae60]'
                    : healthPercent > 25
                    ? 'bg-gradient-to-r from-[#f39c12] to-[#d35400]'
                    : 'bg-gradient-to-r from-[#e74c3c] to-[#c0392b]'
                }`}
                style={{ width: `${healthPercent}%` }}
              />
              {/* Health Text Overlay */}
              <div className="absolute inset-0 flex items-center justify-center text-xs sm:text-sm font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] tracking-wider">
                {health} / {maxHealth}
              </div>
            </div>
          </div>
        </div>

        {/* Top-Right: Score, Time & Pause Button */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          {/* Score Counter Plaque */}
          <div className="flex items-center gap-1.5 bg-gradient-to-b from-[#5c3710] to-[#381f06] border-2 border-[#9b6f1e] rounded-xl px-3 sm:px-4 py-1.5 shadow-lg text-[#f7edd2]">
            <span className="text-yellow-400 text-base sm:text-lg">★</span>
            <span className="font-bold text-sm sm:text-base tracking-wider text-yellow-300">
              {score}
            </span>
          </div>

          {/* Time Counter Plaque */}
          <div className="flex items-center gap-1.5 bg-gradient-to-b from-[#5c3710] to-[#381f06] border-2 border-[#9b6f1e] rounded-xl px-3 sm:px-4 py-1.5 shadow-lg text-[#f7edd2]">
            <span className="text-amber-200 text-sm sm:text-base">🕒</span>
            <span
              className={`font-mono font-bold text-sm sm:text-base tracking-wider ${
                timeRemaining <= 10 ? 'text-red-400 animate-pulse' : 'text-amber-100'
              }`}
            >
              {timeFormatted}
            </span>
          </div>

          {/* Pause Button */}
          <button
            onClick={onTogglePause}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-b from-[#e6b756] via-[#dfa837] to-[#80550f] border-2 border-[#472909] shadow-lg flex items-center justify-center text-[#3a2007] text-base sm:text-xl font-black hover:brightness-110 active:scale-95 cursor-pointer"
            aria-label="Pause Game"
          >
            ❚❚
          </button>
        </div>
      </div>

      {/* Keyboard Controls Reminder (Center Top / Discreet) */}
      <div className="hidden md:flex justify-center opacity-70 hover:opacity-100 transition-opacity">
        <div className="bg-black/50 backdrop-blur-xs text-xs px-4 py-1 rounded-full border border-white/20 text-stone-300 flex gap-4">
          <span><b>W / ↑</b> Move</span>
          <span><b>A / D / ← →</b> Steer</span>
          <span><b>SPACE / J</b> Front Cannon</span>
          <span><b>Q / K</b> Port Broadside</span>
          <span><b>E / L</b> Starboard Broadside</span>
          <span><b>ESC</b> Pause</span>
        </div>
      </div>

      {/* Bottom Virtual Touch Controls (Always available & touch-friendly for Mobile/Tablet) */}
      <div className="w-full flex items-end justify-between pb-2">
        {/* Left Side: Steering & Movement Controls */}
        <div className="flex items-center gap-2 sm:gap-4 pointer-events-auto">
          {/* Turn Left */}
          <button
            onPointerDown={() => onVirtualInput('turnLeft', true)}
            onPointerUp={() => onVirtualInput('turnLeft', false)}
            onPointerLeave={() => onVirtualInput('turnLeft', false)}
            className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-[#e6b756] to-[#80550f] border-2 sm:border-3 border-[#472909] shadow-2xl flex items-center justify-center text-2xl sm:text-3xl text-[#3a2007] font-bold active:scale-90"
            aria-label="Turn Left"
          >
            ↶
          </button>

          {/* Forward Move */}
          <button
            onPointerDown={() => onVirtualInput('forward', true)}
            onPointerUp={() => onVirtualInput('forward', false)}
            onPointerLeave={() => onVirtualInput('forward', false)}
            className="w-15 h-15 sm:w-18 sm:h-18 -mt-6 rounded-full bg-gradient-to-b from-[#fce79f] via-[#dfa837] to-[#80550f] border-3 sm:border-4 border-[#472909] shadow-2xl flex items-center justify-center text-3xl sm:text-4xl text-[#3a2007] font-black active:scale-90"
            aria-label="Move Forward"
          >
            ↑
          </button>

          {/* Turn Right */}
          <button
            onPointerDown={() => onVirtualInput('turnRight', true)}
            onPointerUp={() => onVirtualInput('turnRight', false)}
            onPointerLeave={() => onVirtualInput('turnRight', false)}
            className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-[#e6b756] to-[#80550f] border-2 sm:border-3 border-[#472909] shadow-2xl flex items-center justify-center text-2xl sm:text-3xl text-[#3a2007] font-bold active:scale-90"
            aria-label="Turn Right"
          >
            ↷
          </button>
        </div>

        {/* Right Side: Attack Cannons (Frontal + Left/Right Broadsides) */}
        <div className="flex items-center gap-2 sm:gap-4 pointer-events-auto">
          {/* Left Broadside (3 balls port) */}
          <button
            onPointerDown={() => onVirtualInput('fireLeft', true)}
            onPointerUp={() => onVirtualInput('fireLeft', false)}
            onPointerLeave={() => onVirtualInput('fireLeft', false)}
            className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-[#e6b756] to-[#80550f] border-2 sm:border-3 border-[#472909] shadow-2xl flex flex-col items-center justify-center active:scale-90"
            aria-label="Fire Port Broadside"
            title="Fire Left Broadside"
          >
            <div className="flex gap-0.5">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#3a2007]" />
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#3a2007]" />
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#3a2007]" />
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-[#3a2007]">PORT</span>
          </button>

          {/* Front Cannon (single ball) */}
          <button
            onPointerDown={() => onVirtualInput('fireFront', true)}
            onPointerUp={() => onVirtualInput('fireFront', false)}
            onPointerLeave={() => onVirtualInput('fireFront', false)}
            className="w-15 h-15 sm:w-18 sm:h-18 -mt-6 rounded-full bg-gradient-to-b from-[#fce79f] via-[#dfa837] to-[#80550f] border-3 sm:border-4 border-[#472909] shadow-2xl flex flex-col items-center justify-center active:scale-90"
            aria-label="Fire Frontal Cannon"
            title="Fire Frontal Cannon"
          >
            <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#3a2007] shadow-inner" />
            <span className="text-[10px] sm:text-xs font-black text-[#3a2007] mt-0.5">BOW</span>
          </button>

          {/* Right Broadside (3 balls starboard) */}
          <button
            onPointerDown={() => onVirtualInput('fireRight', true)}
            onPointerUp={() => onVirtualInput('fireRight', false)}
            onPointerLeave={() => onVirtualInput('fireRight', false)}
            className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-[#e6b756] to-[#80550f] border-2 sm:border-3 border-[#472909] shadow-2xl flex flex-col items-center justify-center active:scale-90"
            aria-label="Fire Starboard Broadside"
            title="Fire Right Broadside"
          >
            <div className="flex gap-0.5">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#3a2007]" />
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#3a2007]" />
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#3a2007]" />
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-[#3a2007]">STBD</span>
          </button>
        </div>
      </div>
    </div>
  );
};
