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
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      AudioManager.getInstance().playSfx('ui_click');
      onClick?.(e);
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      AudioManager.getInstance().playSfx('ui_hover', 1.0, 0.4);
      onMouseEnter?.(e);
    }
  };

  let baseStyle = 'relative select-none font-bold uppercase transition-transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer ';

  if (variant === 'primary') {
    // Golden wood banner with gold bolts matching sample_menu.png
    baseStyle += 'bg-gradient-to-b from-[#e6b756] via-[#dfa837] to-[#a37119] text-[#331c04] border-2 border-[#573108] rounded-xl shadow-[0_4px_8px_rgba(0,0,0,0.6),inset_0_2px_2px_rgba(255,255,255,0.4)] hover:brightness-110 active:brightness-90 tracking-wider ';
    if (size === 'md') baseStyle += 'px-8 py-3 text-lg min-w-[200px] ';
    if (size === 'lg') baseStyle += 'px-10 py-4 text-xl min-w-[240px] ';
    if (size === 'sm') baseStyle += 'px-4 py-2 text-sm min-w-[120px] ';
  } else if (variant === 'secondary') {
    // Darker wood/blue panel with gold trim matching sample_menu.png
    baseStyle += 'bg-gradient-to-b from-[#243f5e] to-[#122438] text-[#f7edd2] border-2 border-[#a37119] rounded-xl shadow-[0_3px_6px_rgba(0,0,0,0.5)] hover:border-[#dfa837] hover:text-[#fff2a3] tracking-wide ';
    if (size === 'md') baseStyle += 'px-6 py-2.5 text-sm min-w-[140px] ';
    if (size === 'sm') baseStyle += 'px-3 py-1.5 text-xs min-w-[100px] ';
  } else if (variant === 'round') {
    // Round circular button for (-) (+) or pause
    baseStyle += 'rounded-full bg-gradient-to-b from-[#dfa837] to-[#875c24] text-[#3a2007] border-2 border-[#472909] shadow-[0_3px_6px_rgba(0,0,0,0.5)] flex items-center justify-center hover:brightness-110 ';
    if (size === 'md') baseStyle += 'w-10 h-10 text-xl ';
    if (size === 'lg') baseStyle += 'w-14 h-14 text-2xl ';
    if (size === 'sm') baseStyle += 'w-8 h-8 text-base ';
  } else if (variant === 'tabActive') {
    baseStyle += 'bg-gradient-to-b from-[#e6b756] to-[#a37119] text-[#331c04] border-2 border-[#573108] rounded-lg px-6 py-2 text-sm shadow-md ';
  } else if (variant === 'tabInactive') {
    baseStyle += 'bg-[#18283b] text-[#c5ad83] border-2 border-[#473017] rounded-lg px-6 py-2 text-sm hover:text-[#f7edd2] hover:border-[#875c24] ';
  }

  return (
    <button
      className={`${baseStyle} ${className}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      disabled={disabled}
      {...props}
    >
      {/* Decorative Golden Corner Screws on Primary Buttons */}
      {variant === 'primary' && (
        <>
          <span className="absolute left-1.5 top-1.5 w-2 h-2 rounded-full bg-[#fce79f] border border-[#7a4c15] shadow-xs" />
          <span className="absolute right-1.5 top-1.5 w-2 h-2 rounded-full bg-[#fce79f] border border-[#7a4c15] shadow-xs" />
          <span className="absolute left-1.5 bottom-1.5 w-2 h-2 rounded-full bg-[#fce79f] border border-[#7a4c15] shadow-xs" />
          <span className="absolute right-1.5 bottom-1.5 w-2 h-2 rounded-full bg-[#fce79f] border border-[#7a4c15] shadow-xs" />
        </>
      )}
      {children}
    </button>
  );
};
