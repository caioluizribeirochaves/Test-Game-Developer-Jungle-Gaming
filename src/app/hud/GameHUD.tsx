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
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const healthPercent = Math.max(0, Math.min(100, Math.round((health / maxHealth) * 100)));

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3 sm:p-5 overflow-hidden select-none">
      {/* Top Header Bar */}
      <div className="w-full flex items-start justify-between">
        {/* Top-Left: Wooden Health Bar Frame with Heart (matching Image 4) */}
        <div className="flex items-center gap-1 pointer-events-auto">
          {/* Heart Icon */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-b from-[#e6b756] to-[#80550f] border-2 border-[#4a2e07] shadow-lg flex items-center justify-center -mr-2.5 z-10">
            <img
              src="/assets/png/default/ui/hud/icon_heart.png"
              alt="Heart"
              className="w-5 h-5 sm:w-6 sm:h-6 object-contain drop-shadow"
            />
          </div>

          {/* Wooden Health Frame */}
          <div className="relative w-44 sm:w-56 h-8 sm:h-9 bg-gradient-to-b from-[#5c3710] to-[#381f06] border-2 border-[#9b6f1e] rounded-xl shadow-lg p-1 flex items-center">
            <div className="w-full h-full bg-[#152332] rounded-lg overflow-hidden relative border border-[#2b3a4a]">
              {/* Health Fill Bar */}
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
              {/* Numerical Text Overlay */}
              <div className="absolute inset-0 flex items-center justify-center text-xs sm:text-sm font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] tracking-wider">
                {health} / {maxHealth}
              </div>
            </div>
          </div>
        </div>

        {/* Top-Right: Score, Time & Pause Buttons (matching Image 4) */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          {/* Score Counter Badge */}
          <div className="flex items-center gap-1.5 bg-gradient-to-b from-[#5c3710] to-[#381f06] border-2 border-[#9b6f1e] rounded-xl px-3 sm:px-4 py-1.5 shadow-lg text-[#f7edd2]">
            <img
              src="/assets/png/default/ui/hud/icon_score.png"
              alt="Score"
              className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
            />
            <span className="font-bold text-sm sm:text-base tracking-wider text-yellow-300 font-mono">
              {score}
            </span>
          </div>

          {/* Time Counter Badge */}
          <div className="flex items-center gap-1.5 bg-gradient-to-b from-[#5c3710] to-[#381f06] border-2 border-[#9b6f1e] rounded-xl px-3 sm:px-4 py-1.5 shadow-lg text-[#f7edd2]">
            <img
              src="/assets/png/default/ui/hud/icon_time.png"
              alt="Time"
              className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
            />
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

      {/* Bottom Virtual Touch Controls with Key Hint Badges (matching Image 4) */}
      <div className="w-full flex items-end justify-between pb-2">
        {/* Left Side: Steering and Movement Controls */}
        <div className="flex items-end gap-2 sm:gap-3 pointer-events-auto">
          {/* Turn Left */}
          <div className="flex flex-col items-center">
            <button
              onPointerDown={() => onVirtualInput('turnLeft', true)}
              onPointerUp={() => onVirtualInput('turnLeft', false)}
              onPointerLeave={() => onVirtualInput('turnLeft', false)}
              className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-[#e6b756] to-[#80550f] border-2 border-[#472909] shadow-xl flex items-center justify-center active:scale-90"
              aria-label="Turn Left"
            >
              <img
                src="/assets/png/default/ui/controls/icon_turn_left.png"
                alt="Turn Left"
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
              />
            </button>
            <span className="text-[10px] sm:text-xs font-mono font-bold text-stone-300 bg-black/60 px-1.5 py-0.2 rounded border border-stone-600 mt-1">
              A
            </span>
          </div>

          {/* Move Forward */}
          <div className="flex flex-col items-center -mb-2">
            <button
              onPointerDown={() => onVirtualInput('forward', true)}
              onPointerUp={() => onVirtualInput('forward', false)}
              onPointerLeave={() => onVirtualInput('forward', false)}
              className="w-15 h-15 sm:w-18 sm:h-18 rounded-full bg-gradient-to-b from-[#fce79f] via-[#dfa837] to-[#80550f] border-3 border-[#472909] shadow-2xl flex items-center justify-center active:scale-90"
              aria-label="Move Forward"
            >
              <img
                src="/assets/png/default/ui/controls/icon_forward.png"
                alt="Move Forward"
                className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
              />
            </button>
            <span className="text-[10px] sm:text-xs font-mono font-bold text-stone-300 bg-black/60 px-1.5 py-0.2 rounded border border-stone-600 mt-1">
              W
            </span>
          </div>

          {/* Turn Right */}
          <div className="flex flex-col items-center">
            <button
              onPointerDown={() => onVirtualInput('turnRight', true)}
              onPointerUp={() => onVirtualInput('turnRight', false)}
              onPointerLeave={() => onVirtualInput('turnRight', false)}
              className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-[#e6b756] to-[#80550f] border-2 border-[#472909] shadow-xl flex items-center justify-center active:scale-90"
              aria-label="Turn Right"
            >
              <img
                src="/assets/png/default/ui/controls/icon_turn_right.png"
                alt="Turn Right"
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
              />
            </button>
            <span className="text-[10px] sm:text-xs font-mono font-bold text-stone-300 bg-black/60 px-1.5 py-0.2 rounded border border-stone-600 mt-1">
              D
            </span>
          </div>
        </div>

        {/* Right Side: Attack Cannons with Key Hint Badges */}
        <div className="flex items-end gap-2 sm:gap-3 pointer-events-auto">
          {/* Port Broadside (Left) */}
          <div className="flex flex-col items-center">
            <button
              onPointerDown={() => onVirtualInput('fireLeft', true)}
              onPointerUp={() => onVirtualInput('fireLeft', false)}
              onPointerLeave={() => onVirtualInput('fireLeft', false)}
              className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-[#e6b756] to-[#80550f] border-2 border-[#472909] shadow-xl flex items-center justify-center active:scale-90"
              aria-label="Fire Port Broadside"
              title="Port Broadside"
            >
              <img
                src="/assets/png/default/ui/controls/icon_fire_left.png"
                alt="Port Broadside"
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
              />
            </button>
            <span className="text-[10px] sm:text-xs font-mono font-bold text-stone-300 bg-black/60 px-1.5 py-0.2 rounded border border-stone-600 mt-1">
              Q
            </span>
          </div>

          {/* Bow Cannon (Front) */}
          <div className="flex flex-col items-center -mb-2">
            <button
              onPointerDown={() => onVirtualInput('fireFront', true)}
              onPointerUp={() => onVirtualInput('fireFront', false)}
              onPointerLeave={() => onVirtualInput('fireFront', false)}
              className="w-15 h-15 sm:w-18 sm:h-18 rounded-full bg-gradient-to-b from-[#fce79f] via-[#dfa837] to-[#80550f] border-3 border-[#472909] shadow-2xl flex items-center justify-center active:scale-90"
              aria-label="Fire Frontal Cannon"
              title="Bow Cannon"
            >
              <img
                src="/assets/png/default/ui/controls/icon_fire_front.png"
                alt="Bow Cannon"
                className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
              />
            </button>
            <span className="text-[10px] sm:text-xs font-mono font-bold text-stone-300 bg-black/60 px-1.5 py-0.2 rounded border border-stone-600 mt-1">
              Space
            </span>
          </div>

          {/* Starboard Broadside (Right) */}
          <div className="flex flex-col items-center">
            <button
              onPointerDown={() => onVirtualInput('fireRight', true)}
              onPointerUp={() => onVirtualInput('fireRight', false)}
              onPointerLeave={() => onVirtualInput('fireRight', false)}
              className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-[#e6b756] to-[#80550f] border-2 border-[#472909] shadow-xl flex items-center justify-center active:scale-90"
              aria-label="Fire Starboard Broadside"
              title="Starboard Broadside"
            >
              <img
                src="/assets/png/default/ui/controls/icon_fire_right.png"
                alt="Starboard Broadside"
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
              />
            </button>
            <span className="text-[10px] sm:text-xs font-mono font-bold text-stone-300 bg-black/60 px-1.5 py-0.2 rounded border border-stone-600 mt-1">
              E
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
