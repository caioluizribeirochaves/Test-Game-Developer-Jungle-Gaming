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
          borderImageWidth: '32px 28px 32px 28px',
          borderImageRepeat: 'stretch',
        }}
      >
        <div className="relative z-10 w-full h-full px-4 xs:px-6 sm:px-8 py-3 xs:py-4 sm:py-6 flex flex-col items-center justify-between">
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
