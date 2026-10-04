import React from 'react';
import { AudioManager } from '@/engine/audio/AudioManager';

export interface PirateButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'round' | 'tabActive' | 'tabInactive';
  size?: 'sm' | 'md' | 'lg';
  icon?: 'plus' | 'minus' | 'turn_left' | 'turn_right' | 'close' | 'pause' | 'play' | 'restart' | 'settings' | string;
  children?: React.ReactNode;
}

export const PirateButton: React.FC<PirateButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  onClick,
  onMouseEnter,
  disabled,
  className = '',
  ...props
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      AudioManager.getInstance().playSfx('ui_click');
      onClick?.(e);
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      setIsHovered(true);
      AudioManager.getInstance().playSfx('ui_hover', 1.0, 0.4);
      onMouseEnter?.(e);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
  };

  // Primary Button with Authentic Golden Plaque Asset
  if (variant === 'primary') {
    let frame = '/assets/png/retina/ui/menu/button_primary_normal.png';
    if (disabled) frame = '/assets/png/retina/ui/menu/button_primary_disabled.png';
    else if (isPressed) frame = '/assets/png/retina/ui/menu/button_primary_pressed.png';
    else if (isHovered) frame = '/assets/png/retina/ui/menu/button_primary_hover.png';

    let sizeClasses = 'w-[230px] h-[66px] text-base sm:text-lg';
    if (size === 'lg') sizeClasses = 'w-[260px] h-[74px] text-lg sm:text-xl';
    if (size === 'sm') sizeClasses = 'w-[175px] h-[52px] text-xs sm:text-sm';

    return (
      <button
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        disabled={disabled}
        className={`relative flex items-center justify-center select-none cursor-pointer transition-transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)] ${sizeClasses} ${className}`}
        {...props}
      >
        <img
          src={frame}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none"
        />
        <span
          className={`relative z-10 px-4 max-w-[88%] text-center font-serif font-black tracking-widest text-[#3d240c] uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)] whitespace-nowrap overflow-hidden text-ellipsis ${
            isPressed ? 'translate-y-0.5' : ''
          }`}
        >
          {children}
        </span>
      </button>
    );
  }

  // Secondary Button with Authentic Navy-Gold Trim Asset
  if (variant === 'secondary') {
    let frame = '/assets/png/retina/ui/menu/button_secondary_normal.png';
    if (isPressed) frame = '/assets/png/retina/ui/menu/button_secondary_pressed.png';

    let sizeClasses = 'w-[165px] sm:w-[190px] h-[48px] sm:h-[50px] text-[10px] sm:text-xs';
    if (size === 'lg') sizeClasses = 'w-[210px] h-[58px] text-xs sm:text-sm';
    if (size === 'sm') sizeClasses = 'w-[145px] sm:w-[160px] h-[42px] text-[9px] sm:text-[10px]';
    if (size === 'md') sizeClasses = 'w-[175px] sm:w-[200px] h-[48px] sm:h-[50px] text-[10px] sm:text-xs';

    return (
      <button
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        disabled={disabled}
        className={`relative flex items-center justify-center select-none cursor-pointer transition-transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none filter drop-shadow-[0_3px_8px_rgba(0,0,0,0.5)] ${sizeClasses} ${className}`}
        {...props}
      >
        <img
          src={frame}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none"
        />
        <span
          className={`relative z-10 px-3 max-w-[84%] text-center font-serif font-black tracking-normal text-[#f5e6be] uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] whitespace-nowrap overflow-hidden text-ellipsis ${
            isPressed ? 'translate-y-0.5 text-white' : ''
          }`}
        >
          {children}
        </span>
      </button>
    );
  }

  // Round Button with Authentic button_round Asset and Custom Inset / Icons
  if (variant === 'round') {
    let frame = '/assets/png/retina/ui/controls/button_round_normal.png';
    if (isPressed) frame = '/assets/png/retina/ui/controls/button_round_pressed.png';
    else if (isHovered) frame = '/assets/png/retina/ui/controls/button_round_hover.png';

    let sizeClasses = 'w-11 h-11 sm:w-12 sm:h-12 text-lg';
    if (size === 'lg') sizeClasses = 'w-14 h-14 sm:w-16 sm:h-16 text-2xl';
    if (size === 'sm') sizeClasses = 'w-9 h-9 sm:w-10 sm:h-10 text-base';

    // Resolve iconic decoration inside the frame
    let iconSrc: string | null = null;
    const childStr = typeof children === 'string' ? children.trim() : '';

    if (icon === 'minus' || childStr === '-' || childStr === '−' || childStr === '–') {
      iconSrc = '/assets/png/retina/ui/controls/icon_minus.png';
    } else if (icon === 'plus' || childStr === '+') {
      iconSrc = '/assets/png/retina/ui/controls/icon_plus.png';
    } else if (icon === 'turn_left' || childStr === '↶' || childStr === '<' || childStr === '←') {
      iconSrc = '/assets/png/retina/ui/controls/icon_turn_left.png';
    } else if (icon === 'turn_right' || childStr === '↷' || childStr === '>' || childStr === '→') {
      iconSrc = '/assets/png/retina/ui/controls/icon_turn_right.png';
    } else if (icon) {
      iconSrc = icon.startsWith('/') ? icon : `/assets/png/retina/ui/controls/icon_${icon}.png`;
    }

    return (
      <button
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        disabled={disabled}
        className={`relative flex items-center justify-center select-none transition-transform filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.6)] ${
          disabled
            ? 'opacity-40 grayscale contrast-75 cursor-not-allowed pointer-events-none'
            : 'active:scale-92 cursor-pointer'
        } ${sizeClasses} ${className}`}
        {...props}
      >
        <img
          src={frame}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />
        {iconSrc ? (
          <img
            src={iconSrc}
            alt=""
            aria-hidden="true"
            className={`relative z-10 w-[58%] h-[58%] object-contain pointer-events-none filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] ${
              isPressed ? 'translate-y-0.5 scale-95' : ''
            }`}
          />
        ) : (
          <span
            className={`relative z-10 font-serif font-black text-[#fef3c7] drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] ${
              isPressed ? 'translate-y-0.5' : ''
            }`}
          >
            {children}
          </span>
        )}
      </button>
    );
  }

  // Tab Styles for Navigation
  let tabStyle = 'relative select-none font-bold uppercase transition-transform active:scale-95 px-6 py-2 rounded-lg cursor-pointer ';
  if (variant === 'tabActive') {
    tabStyle += 'bg-gradient-to-b from-[#e6b756] to-[#a37119] text-[#331c04] border-2 border-[#573108] text-sm shadow-md ';
  } else {
    tabStyle += 'bg-[#18283b] text-[#c5ad83] border-2 border-[#473017] text-sm hover:text-[#f7edd2] hover:border-[#875c24] ';
  }

  return (
    <button
      className={`${tabStyle} ${className}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
