import React from 'react';
import { PiratePanel } from '../components/PiratePanel';
import { PirateButton } from '../components/PirateButton';
import { useDeviceLayout } from '../hooks/useDeviceLayout';

export interface PauseModalProps {
  onResume: () => void;
  onOptions: () => void;
  onControls?: () => void;
  onMainMenu: () => void;
  isBlurTriggered?: boolean;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onOptions,
  onControls,
  onMainMenu,
  isBlurTriggered = false,
}) => {
  const [showControlsInline, setShowControlsInline] = React.useState(false);
  const { isMobile, isDesktop } = useDeviceLayout();

  return (
    <div className="absolute inset-0 z-40 bg-black/55 backdrop-blur-[2.5px] flex items-center justify-center p-2 sm:p-4 select-none">
      <PiratePanel size="sm" className="max-h-[calc(100dvh-20px)]">
        <h2 className={`${isDesktop ? 'text-2xl sm:text-3xl mb-1' : 'text-base xs:text-lg mb-0.5'} font-extrabold text-[#fce79f] tracking-wider drop-shadow-md`}>
          {showControlsInline ? 'CONTROLS' : 'PAUSED'}
        </h2>
        <p className={`${isDesktop ? 'text-xs sm:text-sm mb-4' : 'text-[9.5px] xs:text-[10.5px] mb-2'} text-[#c5ad83] font-medium`}>
          {showControlsInline
            ? isMobile
              ? 'Touch screen controls guide.'
              : 'Keyboard controls guide.'
            : isBlurTriggered
            ? 'Paused because the game lost focus.'
            : 'Ready when you are.'}
        </p>

        {!showControlsInline ? (
          <div className="flex flex-col items-center w-full">
            <div className={`grid grid-cols-2 ${isDesktop ? 'gap-3 mb-3' : 'gap-1.5 sm:gap-2.5 mb-1 sm:mb-2'} w-full items-center justify-items-center`}>
              <PirateButton
                variant="primary"
                size={isDesktop ? 'sm' : 'xs'}
                onClick={onResume}
                className={isDesktop ? 'w-[155px] h-[44px] text-xs' : 'w-[125px] xs:w-[145px] h-[34px] xs:h-[38px] text-[10px] xs:text-[11px]'}
              >
                RESUME
              </PirateButton>

              <PirateButton
                variant="primary"
                size={isDesktop ? 'sm' : 'xs'}
                onClick={onOptions}
                className={isDesktop ? 'w-[155px] h-[44px] text-xs' : 'w-[125px] xs:w-[145px] h-[34px] xs:h-[38px] text-[10px] xs:text-[11px]'}
              >
                OPTIONS
              </PirateButton>

              <PirateButton
                variant="primary"
                size={isDesktop ? 'sm' : 'xs'}
                onClick={() => {
                  if (onControls) onControls();
                  else setShowControlsInline(true);
                }}
                className={isDesktop ? 'w-[155px] h-[44px] text-xs' : 'w-[125px] xs:w-[145px] h-[34px] xs:h-[38px] text-[10px] xs:text-[11px]'}
              >
                CONTROLS
              </PirateButton>

              <PirateButton
                variant="primary"
                size={isDesktop ? 'sm' : 'xs'}
                onClick={onMainMenu}
                className={isDesktop ? 'w-[155px] h-[44px] text-xs' : 'w-[125px] xs:w-[145px] h-[34px] xs:h-[38px] text-[10px] xs:text-[11px]'}
              >
                MAIN MENU
              </PirateButton>
            </div>

            <p className={`${isDesktop ? 'text-xs mt-1.5' : 'text-[8.5px] xs:text-[9.5px] mt-0.5'} text-stone-400 text-center`}>
              Leaving ends this battle without recording it.
            </p>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* Inline Controls View with Adaptive Mobile / Desktop Rows */}
            <div className={`w-full flex flex-col ${isDesktop ? 'gap-2 text-xs sm:text-sm mb-4' : 'gap-1 text-[9.5px] xs:text-[10.5px] mb-2 sm:mb-2.5'}`}>
              {isMobile ? (
                <>
                  <div className="flex justify-between items-center py-0.5 border-b border-[#25394d]/60">
                    <span className="text-stone-300">Virtual Joystick (Left)</span>
                    <span className="font-semibold text-amber-200">Steer & Sail</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-[#25394d]/60">
                    <span className="text-stone-300">Bow Cannon (Top)</span>
                    <span className="font-semibold text-amber-200">Fire Forward</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-[#25394d]/60">
                    <span className="text-stone-300">Port Broadside (Left)</span>
                    <span className="font-semibold text-amber-200">Fire Left</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-[#25394d]/60">
                    <span className="text-stone-300">Starboard Broadside (Right)</span>
                    <span className="font-semibold text-amber-200">Fire Right</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center py-1 border-b border-[#25394d]/60">
                    <span className="text-stone-300">Sail forward</span>
                    <span className="font-mono text-amber-200">W / ↑</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[#25394d]/60">
                    <span className="text-stone-300">Turn left / right</span>
                    <span className="font-mono text-amber-200">A / D (← →)</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[#25394d]/60">
                    <span className="text-stone-300">Bow cannon</span>
                    <span className="font-mono text-amber-200">Space / K</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[#25394d]/60">
                    <span className="text-stone-300">Port / Starboard broadsides</span>
                    <span className="font-mono text-amber-200">Q / E (J / L)</span>
                  </div>
                </>
              )}
            </div>

            <PirateButton
              variant="secondary"
              size={isDesktop ? 'md' : 'xs'}
              onClick={() => setShowControlsInline(false)}
              className={isDesktop ? 'w-[180px]' : 'w-[125px] xs:w-[145px] h-[32px] xs:h-[36px] text-[10px] xs:text-[11px]'}
            >
              BACK TO PAUSE
            </PirateButton>
          </div>
        )}
      </PiratePanel>
    </div>
  );
};
