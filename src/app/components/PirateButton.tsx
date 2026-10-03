import React from 'react';
import { AudioManager } from '@/engine/audio/AudioManager';

export interface PirateButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'round' | 'tabActive' | 'tabInactive';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const PirateButton: React.FC<PirateButtonProps> = ({
  variant = 'primary',
  size = 'md',
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

    let sizeClasses = 'w-[230px] h-[66px] text-lg';
    if (size === 'lg') sizeClasses = 'w-[260px] h-[74px] text-xl';
    if (size === 'sm') sizeClasses = 'w-[180px] h-[52px] text-sm';

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
          className={`relative z-10 font-serif font-black tracking-widest text-[#3d240c] uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)] ${
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

    let sizeClasses = 'w-[155px] h-[46px] text-xs sm:text-sm';
    if (size === 'lg') sizeClasses = 'w-[200px] h-[58px] text-base';
    if (size === 'sm') sizeClasses = 'w-[140px] h-[42px] text-xs';

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
          className={`relative z-10 font-serif font-bold tracking-wider text-[#f5e6be] uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] ${
            isPressed ? 'translate-y-0.5 text-white' : ''
          }`}
        >
          {children}
        </span>
      </button>
    );
  }

  // Round Button with Authentic button_round Asset
  if (variant === 'round') {
    let frame = '/assets/png/retina/ui/controls/button_round_normal.png';
    if (isPressed) frame = '/assets/png/retina/ui/controls/button_round_pressed.png';
    else if (isHovered) frame = '/assets/png/retina/ui/controls/button_round_hover.png';

    let sizeClasses = 'w-12 h-12 text-lg';
    if (size === 'lg') sizeClasses = 'w-16 h-16 text-2xl';
    if (size === 'sm') sizeClasses = 'w-9 h-9 text-base';

    return (
      <button
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        disabled={disabled}
        className={`relative flex items-center justify-center select-none cursor-pointer transition-transform active:scale-92 filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.5)] ${sizeClasses} ${className}`}
        {...props}
      >
        <img
          src={frame}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />
        <span
          className={`relative z-10 font-bold text-[#3a2007] ${
            isPressed ? 'translate-y-0.5' : ''
          }`}
        >
          {children}
        </span>
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
