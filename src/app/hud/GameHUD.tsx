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
  const fillSrc =
    health >= maxHealth
      ? '/assets/png/retina/ui/hud/health_fill_green.png'
      : healthPercent >= 50
      ? '/assets/png/retina/ui/hud/health_fill_amber.png'
      : '/assets/png/retina/ui/hud/health_fill_red.png';

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3 sm:p-5 overflow-hidden select-none">
      {/* Top Header Bar */}
      <div className="w-full flex items-start justify-between">
        {/* Top-Left: Authentic Health Bar Frame with Heart Medallion */}
        <div className="relative flex items-center gap-2.5 sm:gap-3 pointer-events-auto filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]">
          {/* Heart Icon Medallion */}
          <div className="relative z-20 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center pointer-events-none">
            <img
              src="/assets/png/retina/ui/hud/icon_heart.png"
              alt="Health"
              className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            />
          </div>

          {/* Health Frame with Authentic Fill Asset */}
          <div className="relative w-[210px] sm:w-[260px] h-[38px] sm:h-[44px] flex items-center">
            {/* Base Health Frame Graphic (wood + dark groove background) */}
            <img
              src="/assets/png/retina/ui/hud/health_frame.png"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-fill pointer-events-none z-0"
            />
            {/* Authentic Fill overlay (clipped by health percentage) */}
            <div
              className="absolute inset-0 z-10 overflow-hidden pointer-events-none transition-all duration-200"
              style={{
                clipPath:
                  healthPercent > 0
                    ? `inset(0 ${Math.max(0, 100 - (10.55 + 0.789 * healthPercent))}% 0 0)`
                    : 'inset(0 100% 0 0)',
              }}
            >
              <img
                src={fillSrc}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-fill pointer-events-none"
              />
            </div>
            {/* Numerical Text Overlay */}
            <div className="relative z-20 w-full text-center text-xs sm:text-sm font-serif font-black text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] tracking-wider pl-2">
              {health} / {maxHealth}
            </div>
          </div>
        </div>

        {/* Top-Right: Score, Time & Pause Button */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          {/* Score Counter Panel - Centered Content */}
          <div className="relative w-[105px] sm:w-[115px] h-[38px] sm:h-[42px] flex items-center justify-center gap-2 sm:gap-2.5 px-3 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
            <img
              src="/assets/png/retina/ui/hud/counter_panel.png"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-fill pointer-events-none"
            />
            <img
              src="/assets/png/retina/ui/hud/icon_score.png"
              alt="Score"
              className="relative z-10 w-5 h-5 sm:w-5.5 sm:h-5.5 object-contain pointer-events-none drop-shadow"
            />
            <span className="relative z-10 font-bold text-sm sm:text-base tracking-wider text-yellow-300 font-mono drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
              {score}
            </span>
          </div>

          {/* Time Counter Panel - Centered Content */}
          <div className="relative w-[115px] sm:w-[125px] h-[38px] sm:h-[42px] flex items-center justify-center gap-2 sm:gap-2.5 px-3 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
            <img
              src="/assets/png/retina/ui/hud/counter_panel.png"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-fill pointer-events-none"
            />
            <img
              src="/assets/png/retina/ui/hud/icon_time.png"
              alt="Time"
              className="relative z-10 w-5 h-5 sm:w-5.5 sm:h-5.5 object-contain pointer-events-none drop-shadow"
            />
            <span
              className={`relative z-10 font-mono font-bold text-sm sm:text-base tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] ${
                timeRemaining <= 10 ? 'text-red-400 animate-pulse' : 'text-[#f5e6be]'
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
