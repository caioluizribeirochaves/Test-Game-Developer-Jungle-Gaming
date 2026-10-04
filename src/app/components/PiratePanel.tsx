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
    // Responsive menu panel using authentic 9-slice border image to seamlessly frame contents without spill
    return (
      <div
        className={`relative z-10 w-[92vw] max-w-[420px] select-none filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.85)] ${className}`}
        style={{
          borderImageSource: "url('/assets/png/retina/ui/menu/panel_menu.png')",
          borderImageSlice: '80 64 80 64 fill',
          borderImageWidth: '24px 20px 24px 20px',
          borderImageRepeat: 'stretch',
        }}
      >
        <div className="relative z-10 w-full h-full px-3 xs:px-5 sm:px-7 py-2.5 xs:py-3.5 sm:py-5 flex flex-col items-center justify-between">
          {children}
        </div>
      </div>
    );
  }

  // General 9-slice / framed modal dialog for options, logs, etc.
  let maxWidth = 'max-w-[460px]';
  if (size === 'sm') maxWidth = 'max-w-[360px]';
  if (size === 'lg') maxWidth = 'max-w-[560px]';
  if (size === 'wide') maxWidth = 'max-w-[740px]';

  return (
    <div
      className={`relative z-10 p-1 sm:p-2 w-[94vw] ${maxWidth} select-none filter drop-shadow-[0_16px_36px_rgba(0,0,0,0.85)] ${className}`}
      style={{
        borderImageSource: "url('/assets/png/retina/ui/menu/panel_menu.png')",
        borderImageSlice: '80 64 80 64 fill',
        borderImageWidth: '22px 18px 22px 18px',
        borderImageRepeat: 'stretch',
      }}
    >
      <div className="relative w-full h-full p-2.5 xs:p-3 sm:p-5 flex flex-col items-center">
        {children}
      </div>
    </div>
  );
};
