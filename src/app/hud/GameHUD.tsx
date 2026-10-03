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

interface RoundControlButtonProps {
  icon: string;
  alt: string;
  keyLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  onPointerDown?: () => void;
  onPointerUp?: () => void;
  onPointerLeave?: () => void;
  onClick?: () => void;
  className?: string;
  ariaLabel: string;
}

const RoundControlButton: React.FC<RoundControlButtonProps> = ({
  icon,
  alt,
  keyLabel,
  size = 'md',
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onClick,
  className = '',
  ariaLabel,
}) => {
  const [isPressed, setIsPressed] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const frameSrc = isPressed
    ? '/assets/png/retina/ui/controls/button_round_pressed.png'
    : isHovered
    ? '/assets/png/retina/ui/controls/button_round_hover.png'
    : '/assets/png/retina/ui/controls/button_round_normal.png';

  const sizeStyles = {
    sm: 'w-10 h-10 sm:w-11 sm:h-11',
    md: 'w-14 h-14 sm:w-16 sm:h-16',
    lg: 'w-16 h-16 sm:w-18 sm:h-18',
  }[size];

  const iconSizes = {
    sm: 'w-5 h-5 sm:w-6 sm:h-6',
    md: 'w-8 h-8 sm:w-9 sm:h-9',
    lg: 'w-9 h-9 sm:w-10 sm:h-10',
  }[size];

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <button
        onPointerDown={() => {
          setIsPressed(true);
          onPointerDown?.();
        }}
        onPointerUp={() => {
          setIsPressed(false);
          onPointerUp?.();
        }}
        onPointerLeave={() => {
          setIsPressed(false);
          setIsHovered(false);
          onPointerLeave?.();
        }}
        onMouseEnter={() => setIsHovered(true)}
        onClick={onClick}
        className={`relative ${sizeStyles} flex items-center justify-center cursor-pointer transition-transform active:scale-95 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]`}
        aria-label={ariaLabel}
      >
        <img
          src={frameSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />
        <img
          src={icon}
          alt={alt}
          className={`relative z-10 ${iconSizes} object-contain transition-transform ${
            isPressed ? 'translate-y-0.5 scale-95' : ''
          }`}
        />
      </button>
      {keyLabel && (
        <span className="text-[10px] sm:text-xs font-mono font-bold text-stone-200 bg-black/75 px-2 py-0.5 rounded border border-amber-900/60 shadow-md mt-1 pointer-events-none">
          {keyLabel}
        </span>
      )}
    </div>
  );
};

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
        {/* Top-Left: Wooden Health Bar Frame with Heart */}
        <div className="flex items-center gap-1 pointer-events-auto">
          {/* Heart Icon */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-b from-[#e6b756] to-[#80550f] border-2 border-[#4a2e07] shadow-lg flex items-center justify-center -mr-2.5 z-10">
            <img
              src="/assets/png/retina/ui/hud/icon_heart.png"
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

        {/* Top-Right: Score, Time & Pause Button */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          {/* Score Counter Badge */}
          <div className="flex items-center gap-1.5 bg-gradient-to-b from-[#5c3710] to-[#381f06] border-2 border-[#9b6f1e] rounded-xl px-3 sm:px-4 py-1.5 shadow-lg text-[#f7edd2]">
            <img
              src="/assets/png/retina/ui/hud/icon_score.png"
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
              src="/assets/png/retina/ui/hud/icon_time.png"
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

          {/* Pause Button framed with round button asset */}
          <RoundControlButton
            icon="/assets/png/retina/ui/controls/icon_pause.png"
            alt="Pause"
            size="sm"
            onClick={onTogglePause}
            ariaLabel="Pause Game"
          />
        </div>
      </div>

      {/* Bottom Virtual Touch Controls with Key Hint Badges */}
      <div className="w-full flex items-end justify-between pb-2">
        {/* Left Side: Steering and Movement Controls */}
        <div className="flex items-end gap-2 sm:gap-3 pointer-events-auto">
          {/* Turn Left */}
          <RoundControlButton
            icon="/assets/png/retina/ui/controls/icon_turn_left.png"
            alt="Turn Left"
            keyLabel="A"
            size="md"
            onPointerDown={() => onVirtualInput('turnLeft', true)}
            onPointerUp={() => onVirtualInput('turnLeft', false)}
            onPointerLeave={() => onVirtualInput('turnLeft', false)}
            ariaLabel="Turn Left"
          />

          {/* Move Forward */}
          <RoundControlButton
            icon="/assets/png/retina/ui/controls/icon_forward.png"
            alt="Move Forward"
            keyLabel="W"
            size="lg"
            className="-mb-2"
            onPointerDown={() => onVirtualInput('forward', true)}
            onPointerUp={() => onVirtualInput('forward', false)}
            onPointerLeave={() => onVirtualInput('forward', false)}
            ariaLabel="Move Forward"
          />

          {/* Turn Right */}
          <RoundControlButton
            icon="/assets/png/retina/ui/controls/icon_turn_right.png"
            alt="Turn Right"
            keyLabel="D"
            size="md"
            onPointerDown={() => onVirtualInput('turnRight', true)}
            onPointerUp={() => onVirtualInput('turnRight', false)}
            onPointerLeave={() => onVirtualInput('turnRight', false)}
            ariaLabel="Turn Right"
          />
        </div>

        {/* Right Side: Attack Cannons with Key Hint Badges */}
        <div className="flex items-end gap-2 sm:gap-3 pointer-events-auto">
          {/* Port Broadside (Left) */}
          <RoundControlButton
            icon="/assets/png/retina/ui/controls/icon_fire_left.png"
            alt="Port Broadside"
            keyLabel="Q"
            size="md"
            onPointerDown={() => onVirtualInput('fireLeft', true)}
            onPointerUp={() => onVirtualInput('fireLeft', false)}
            onPointerLeave={() => onVirtualInput('fireLeft', false)}
            ariaLabel="Fire Port Broadside"
          />

          {/* Bow Cannon (Front) */}
          <RoundControlButton
            icon="/assets/png/retina/ui/controls/icon_fire_front.png"
            alt="Bow Cannon"
            keyLabel="Space"
            size="lg"
            className="-mb-2"
            onPointerDown={() => onVirtualInput('fireFront', true)}
            onPointerUp={() => onVirtualInput('fireFront', false)}
            onPointerLeave={() => onVirtualInput('fireFront', false)}
            ariaLabel="Fire Frontal Cannon"
          />

          {/* Starboard Broadside (Right) */}
          <RoundControlButton
            icon="/assets/png/retina/ui/controls/icon_fire_right.png"
            alt="Starboard Broadside"
            keyLabel="E"
            size="md"
            onPointerDown={() => onVirtualInput('fireRight', true)}
            onPointerUp={() => onVirtualInput('fireRight', false)}
            onPointerLeave={() => onVirtualInput('fireRight', false)}
            ariaLabel="Fire Starboard Broadside"
          />
        </div>
      </div>
    </div>
  );
};
