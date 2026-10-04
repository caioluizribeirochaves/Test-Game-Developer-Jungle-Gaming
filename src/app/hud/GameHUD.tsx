import React, { useState, useEffect, useCallback } from 'react';
import { PlayerInputState, PlayerActionKey } from '@/engine/entities/PlayerShip';
import { VirtualJoystick } from './VirtualJoystick';

export const checkIsMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (
    window.location.search.includes('mobile=true') ||
    window.location.search.includes('controls=mobile')
  ) {
    return true;
  }
  const ua = navigator.userAgent || '';
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobi/i.test(ua);
  const hasTouch =
    (typeof navigator.maxTouchPoints !== 'undefined' && navigator.maxTouchPoints > 0) ||
    'ontouchstart' in window;
  const isNarrowScreen = window.innerWidth <= 840;
  return isMobileUA || (hasTouch && isNarrowScreen) || window.innerWidth <= 768;
};

export interface GameHUDProps {
  health: number;
  maxHealth: number;
  score: number;
  timeRemaining: number;
  onTogglePause: () => void;
  onVirtualInput: (action: PlayerActionKey, value: boolean) => void;
  onJoystickInput?: (x: number, y: number, active: boolean) => void;
}

interface RoundControlButtonProps {
  icon: string;
  alt: string;
  keyLabel?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
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
    xs: 'w-8 h-8 sm:w-9 sm:h-9',
    sm: 'w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11',
    md: 'w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14',
    lg: 'w-13 h-13 sm:w-14 sm:h-14 md:w-16 md:h-16',
  }[size];

  const iconSizes = {
    xs: 'w-4 h-4 sm:w-4.5 sm:h-4.5',
    sm: 'w-4.5 h-4.5 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5',
    md: 'w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8',
    lg: 'w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9',
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
  onJoystickInput,
}) => {
  const [isMobile, setIsMobile] = useState(checkIsMobile);
  const [windowSize, setWindowSize] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 720,
  }));
  const [showRotateHint, setShowRotateHint] = useState(true);

  const isLandscape = windowSize.width > windowSize.height;
  const isMobileLandscape = isMobile && isLandscape && windowSize.height <= 520;
  const isMobilePortrait = isMobile && !isLandscape && windowSize.width <= 600;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(checkIsMobile());
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleJoystickChange = useCallback(
    (x: number, y: number, active: boolean) => {
      onJoystickInput?.(x, y, active);
    },
    [onJoystickInput]
  );

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
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between pt-[max(0.4rem,env(safe-area-inset-top))] pb-[max(0.6rem,env(safe-area-inset-bottom))] pl-[max(0.6rem,env(safe-area-inset-left))] pr-[max(0.6rem,env(safe-area-inset-right))] p-1 xs:p-2 sm:p-3 md:p-5 overflow-hidden select-none">
      {/* Top Header Section */}
      <div className="w-full flex flex-col items-center gap-1 pointer-events-none">
        {/* Top Header Bar */}
        <div className="w-full flex items-start justify-between">
          {/* Top-Left: Authentic Health Bar Frame with Heart Medallion */}
          <div className="relative flex items-center gap-1.5 xs:gap-2 sm:gap-3 pointer-events-auto filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]">
            {/* Heart Icon Medallion */}
            <div className="relative z-20 w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 flex items-center justify-center pointer-events-none">
              <img
                src="/assets/png/retina/ui/hud/icon_heart.png"
                alt="Health"
                className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              />
            </div>

            {/* Health Frame with Authentic Fill Asset */}
            <div className="relative w-[130px] xs:w-[155px] sm:w-[195px] md:w-[260px] h-[26px] xs:h-[28px] sm:h-[34px] md:h-[44px] flex items-center">
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
              <div className="relative z-20 w-full text-center text-[10px] xs:text-[11px] sm:text-xs md:text-sm font-serif font-black text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] tracking-wider pl-1 sm:pl-2">
                {health} / {maxHealth}
              </div>
            </div>
          </div>

          {/* Top-Right: Score, Time & Pause Button */}
          <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 pointer-events-auto">
            {/* Score Counter Panel - Centered Content */}
            <div className="relative w-[64px] xs:w-[72px] sm:w-[90px] md:w-[115px] h-[26px] xs:h-[28px] sm:h-[34px] md:h-[42px] flex items-center justify-center gap-1 xs:gap-1.5 sm:gap-2 px-1.5 xs:px-2 sm:px-3 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
              <img
                src="/assets/png/retina/ui/hud/counter_panel.png"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-fill pointer-events-none"
              />
              <img
                src="/assets/png/retina/ui/hud/icon_score.png"
                alt="Score"
                className="relative z-10 w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 md:w-5.5 md:h-5.5 object-contain pointer-events-none drop-shadow"
              />
              <span className="relative z-10 font-bold text-xs sm:text-sm md:text-base tracking-wider text-yellow-300 font-mono drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                {score}
              </span>
            </div>

            {/* Time Counter Panel - Centered Content */}
            <div className="relative w-[68px] xs:w-[76px] sm:w-[96px] md:w-[125px] h-[26px] xs:h-[28px] sm:h-[34px] md:h-[42px] flex items-center justify-center gap-1 xs:gap-1.5 sm:gap-2 px-1.5 xs:px-2 sm:px-3 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
              <img
                src="/assets/png/retina/ui/hud/counter_panel.png"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-fill pointer-events-none"
              />
              <img
                src="/assets/png/retina/ui/hud/icon_time.png"
                alt="Time"
                className="relative z-10 w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 md:w-5.5 md:h-5.5 object-contain pointer-events-none drop-shadow"
              />
              <span
                className={`relative z-10 font-mono font-bold text-xs sm:text-sm md:text-base tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] ${
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
              size={isMobileLandscape || isMobilePortrait ? 'xs' : 'sm'}
              onClick={onTogglePause}
              ariaLabel="Pause Game"
            />
          </div>
        </div>

        {/* Portrait Mode Advisory Hint: Rotate to Landscape (pinned just below header) */}
        {isMobilePortrait && showRotateHint && (
          <div className="pointer-events-auto flex items-center gap-2 px-3 py-1 rounded-full bg-black/80 border border-amber-600/70 shadow-2xl text-[10px] sm:text-xs text-amber-200 mt-0.5">
            <span className="text-sm">🔄</span>
            <span>Vire na horizontal para melhor visualização!</span>
            <button
              onClick={() => setShowRotateHint(false)}
              className="ml-1 text-stone-400 hover:text-white font-bold text-xs px-1"
              aria-label="Fechar aviso"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      {isMobile ? (
        /* Mobile Controls: Virtual Joystick on Left (Image 2) & Triangular Cannon Buttons on Right (Image 1) */
        <div className="w-full flex items-end justify-between pb-0.5 sm:pb-1.5 px-0.5 sm:px-2">
          {/* Left: Virtual Joystick (Image 2) */}
          <div className="pointer-events-auto filter drop-shadow-[0_6px_14px_rgba(0,0,0,0.7)]">
            <VirtualJoystick
              onChange={handleJoystickChange}
              size={isMobileLandscape ? 98 : isMobilePortrait ? 114 : 140}
              knobSize={isMobileLandscape ? 42 : isMobilePortrait ? 48 : 58}
            />
          </div>

          {/* Right: Triangular Cannon Fire Buttons Cluster (Image 1) */}
          <div className="flex flex-col items-center pointer-events-auto select-none filter drop-shadow-[0_6px_14px_rgba(0,0,0,0.7)]">
            {/* Top Apex: Bow Cannon (Front) */}
            <RoundControlButton
              icon="/assets/png/retina/ui/controls/icon_fire_front.png"
              alt="Bow Cannon"
              size={isMobileLandscape ? 'sm' : isMobilePortrait ? 'sm' : 'lg'}
              className="mb-1"
              onPointerDown={() => onVirtualInput('fireFront', true)}
              onPointerUp={() => onVirtualInput('fireFront', false)}
              onPointerLeave={() => onVirtualInput('fireFront', false)}
              ariaLabel="Fire Frontal Cannon"
            />
            {/* Bottom Row: Port Broadside (Left) & Starboard Broadside (Right) */}
            <div className={`flex items-center ${isMobileLandscape ? 'gap-2 sm:gap-2.5' : 'gap-2.5 sm:gap-4'}`}>
              <RoundControlButton
                icon="/assets/png/retina/ui/controls/icon_fire_left.png"
                alt="Port Broadside"
                size={isMobileLandscape ? 'sm' : isMobilePortrait ? 'sm' : 'lg'}
                onPointerDown={() => onVirtualInput('fireLeft', true)}
                onPointerUp={() => onVirtualInput('fireLeft', false)}
                onPointerLeave={() => onVirtualInput('fireLeft', false)}
                ariaLabel="Fire Port Broadside"
              />
              <RoundControlButton
                icon="/assets/png/retina/ui/controls/icon_fire_right.png"
                alt="Starboard Broadside"
                size={isMobileLandscape ? 'sm' : isMobilePortrait ? 'sm' : 'lg'}
                onPointerDown={() => onVirtualInput('fireRight', true)}
                onPointerUp={() => onVirtualInput('fireRight', false)}
                onPointerLeave={() => onVirtualInput('fireRight', false)}
                ariaLabel="Fire Starboard Broadside"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Desktop Keyboard Controls with Shortcut Badges */
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
      )}
    </div>
  );
};
