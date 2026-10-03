import React from 'react';

export interface PiratePanelProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'wide';
}

export const PiratePanel: React.FC<PiratePanelProps> = ({
  children,
  className = '',
  size = 'md',
}) => {
  let sizeClasses = 'w-[90vw] max-w-[480px]';
  if (size === 'sm') sizeClasses = 'w-[85vw] max-w-[400px]';
  if (size === 'lg') sizeClasses = 'w-[92vw] max-w-[580px]';
  if (size === 'wide') sizeClasses = 'w-[96vw] max-w-[820px]';

  return (
    <div
      className={`relative z-10 p-3 bg-gradient-to-b from-[#875522] via-[#633b13] to-[#422307] rounded-3xl shadow-[0_12px_32px_rgba(0,0,0,0.85)] border-4 border-[#331c05] ${sizeClasses} ${className}`}
    >
      {/* 4 Golden Corner Ornaments */}
      <div className="absolute -top-1 -left-1 w-8 h-8 rounded-tl-2xl bg-gradient-to-br from-[#ffe594] via-[#dfa837] to-[#80550f] border-2 border-[#523307] shadow-md flex items-center justify-center pointer-events-none">
        <div className="w-2 h-2 rounded-full bg-[#422606]" />
      </div>
      <div className="absolute -top-1 -right-1 w-8 h-8 rounded-tr-2xl bg-gradient-to-bl from-[#ffe594] via-[#dfa837] to-[#80550f] border-2 border-[#523307] shadow-md flex items-center justify-center pointer-events-none">
        <div className="w-2 h-2 rounded-full bg-[#422606]" />
      </div>
      <div className="absolute -bottom-1 -left-1 w-8 h-8 rounded-bl-2xl bg-gradient-to-tr from-[#ffe594] via-[#dfa837] to-[#80550f] border-2 border-[#523307] shadow-md flex items-center justify-center pointer-events-none">
        <div className="w-2 h-2 rounded-full bg-[#422606]" />
      </div>
      <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-br-2xl bg-gradient-to-tl from-[#ffe594] via-[#dfa837] to-[#80550f] border-2 border-[#523307] shadow-md flex items-center justify-center pointer-events-none">
        <div className="w-2 h-2 rounded-full bg-[#422606]" />
      </div>

      {/* Inner Nautical Texture Container */}
      <div className="relative w-full h-full bg-gradient-to-b from-[#1c3047] to-[#0e1925] border-2 border-[#2a4563] rounded-2xl p-6 sm:p-8 flex flex-col items-center shadow-inner">
        {children}
      </div>
    </div>
  );
};
