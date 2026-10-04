import React from 'react';

export interface PiratePanelProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'wide' | 'menu';
}

export const PiratePanel: React.FC<PiratePanelProps> = ({
  children,
  className = '',
  size = 'md',
}) => {
  if (size === 'menu') {
    // Responsive menu panel: constrained by both max width and max height for landscape phones
    return (
      <div
        className={`relative w-[92vw] max-w-[min(440px,calc(92vh*768/960))] aspect-[768/960] max-h-[92vh] select-none flex flex-col filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.85)] ${className}`}
      >
        <img
          src="/assets/png/retina/ui/menu/panel_menu.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none"
        />
        <div className="relative z-10 w-full h-full px-5 sm:px-7 md:px-9 py-4 sm:py-6 md:py-8 flex flex-col items-center justify-between">
          {children}
        </div>
      </div>
    );
  }

  // General 9-slice / framed modal dialog for options, logs, etc.
  let maxWidth = 'max-w-[480px]';
  if (size === 'sm') maxWidth = 'max-w-[380px]';
  if (size === 'lg') maxWidth = 'max-w-[580px]';
  if (size === 'wide') maxWidth = 'max-w-[760px]';

  return (
    <div
      className={`relative z-10 p-2 sm:p-3 w-[92vw] ${maxWidth} select-none filter drop-shadow-[0_16px_36px_rgba(0,0,0,0.85)] ${className}`}
      style={{
        borderImageSource: "url('/assets/png/retina/ui/menu/panel_menu.png')",
        borderImageSlice: '80 64 80 64 fill',
        borderImageWidth: '32px 28px 32px 28px',
        borderImageRepeat: 'stretch',
      }}
    >
      <div className="relative w-full h-full p-4 sm:p-6 flex flex-col items-center">
        {children}
      </div>
    </div>
  );
};
