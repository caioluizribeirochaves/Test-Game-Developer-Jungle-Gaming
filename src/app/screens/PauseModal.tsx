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
  const { isMobile, isDesktop, isMobileLandscape } = useDeviceLayout();

  return (
    <div className="absolute inset-0 z-40 bg-black/55 backdrop-blur-[2.5px] flex items-center justify-center p-2 sm:p-4 select-none">
      <PiratePanel size={isDesktop ? 'md' : 'sm'} className={isDesktop ? 'max-w-[390px] max-h-[calc(100dvh-20px)]' : 'max-h-[calc(100dvh-20px)]'}>
        <h2 className={`${isDesktop ? 'text-2xl sm:text-3xl mb-1' : 'text-base xs:text-lg mb-0.5'} font-extrabold text-[#fce79f] tracking-wider drop-shadow-md text-center`}>
          {showControlsInline ? 'CONTROLS' : 'PAUSED'}
        </h2>
        <p className={`${isDesktop ? 'text-xs sm:text-sm mb-4 sm:mb-5' : 'text-[9.5px] xs:text-[10.5px] mb-2'} text-[#c5ad83] font-medium text-center`}>
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
            {/* DESKTOP VIEW: Generous, original vertical column with large golden plaques and ample spacing */}
            {isDesktop ? (
              <div className="flex flex-col gap-3 sm:gap-3.5 w-full items-center mb-2">
                <PirateButton
                  variant="primary"
                  size="md"
                  onClick={onResume}
                  className="w-[210px] sm:w-[230px] h-[52px] sm:h-[60px] text-sm sm:text-base"
                >
                  RESUME
                </PirateButton>

                <PirateButton
                  variant="primary"
                  size="md"
                  onClick={onOptions}
                  className="w-[210px] sm:w-[230px] h-[52px] sm:h-[60px] text-sm sm:text-base"
                >
                  OPTIONS
                </PirateButton>

                <PirateButton
                  variant="primary"
                  size="md"
                  onClick={() => {
                    if (onControls) onControls();
                    else setShowControlsInline(true);
                  }}
                  className="w-[210px] sm:w-[230px] h-[52px] sm:h-[60px] text-sm sm:text-base"
                >
                  CONTROLS
                </PirateButton>

                <PirateButton
                  variant="primary"
                  size="md"
                  onClick={onMainMenu}
                  className="w-[210px] sm:w-[230px] h-[52px] sm:h-[60px] text-sm sm:text-base"
                >
                  MAIN MENU
                </PirateButton>

                <p className="text-xs text-stone-400 mt-2 text-center">
                  Leaving ends this battle without recording it.
                </p>
              </div>
            ) : isMobileLandscape ? (
              /* MOBILE LANDSCAPE VIEW: 2-column grid with generous horizontal and vertical separation */
              <div className="flex flex-col items-center w-full">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full items-center justify-items-center mb-1.5">
                  <PirateButton
                    variant="primary"
                    size="xs"
                    onClick={onResume}
                    className="w-[125px] xs:w-[135px] h-[34px] xs:h-[36px] text-[10px] xs:text-[11px]"
                  >
                    RESUME
                  </PirateButton>

                  <PirateButton
                    variant="primary"
                    size="xs"
                    onClick={onOptions}
                    className="w-[125px] xs:w-[135px] h-[34px] xs:h-[36px] text-[10px] xs:text-[11px]"
                  >
                    OPTIONS
                  </PirateButton>

                  <PirateButton
                    variant="primary"
                    size="xs"
                    onClick={() => {
                      if (onControls) onControls();
                      else setShowControlsInline(true);
                    }}
                    className="w-[125px] xs:w-[135px] h-[34px] xs:h-[36px] text-[10px] xs:text-[11px]"
                  >
                    CONTROLS
                  </PirateButton>

                  <PirateButton
                    variant="primary"
                    size="xs"
                    onClick={onMainMenu}
                    className="w-[125px] xs:w-[135px] h-[34px] xs:h-[36px] text-[10px] xs:text-[11px]"
                  >
                    MAIN MENU
                  </PirateButton>
                </div>

                <p className="text-[8.5px] xs:text-[9.5px] text-stone-400 text-center">
                  Leaving ends this battle without recording it.
                </p>
              </div>
            ) : (
              /* MOBILE PORTRAIT VIEW: Clean vertical stack */
              <div className="flex flex-col gap-2 w-full items-center mb-2">
                <PirateButton
                  variant="primary"
                  size="sm"
                  onClick={onResume}
                  className="w-[165px] xs:w-[185px] h-[38px] xs:h-[42px] text-xs"
                >
                  RESUME
                </PirateButton>

                <PirateButton
                  variant="primary"
                  size="sm"
                  onClick={onOptions}
                  className="w-[165px] xs:w-[185px] h-[38px] xs:h-[42px] text-xs"
                >
                  OPTIONS
                </PirateButton>

                <PirateButton
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (onControls) onControls();
                    else setShowControlsInline(true);
                  }}
                  className="w-[165px] xs:w-[185px] h-[38px] xs:h-[42px] text-xs"
                >
                  CONTROLS
                </PirateButton>

                <PirateButton
                  variant="primary"
                  size="sm"
                  onClick={onMainMenu}
                  className="w-[165px] xs:w-[185px] h-[38px] xs:h-[42px] text-xs"
                >
                  MAIN MENU
                </PirateButton>

                <p className="text-[9.5px] text-stone-400 mt-1 text-center">
                  Leaving ends this battle without recording it.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* Inline Controls View with Adaptive Mobile / Desktop Rows */}
            <div className={`w-full flex flex-col ${isDesktop ? 'gap-2.5 text-xs sm:text-sm mb-5 w-full max-w-[340px]' : 'gap-1 text-[9.5px] xs:text-[10.5px] mb-2 sm:mb-2.5'}`}>
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
                  <div className="flex justify-between items-center py-1.5 border-b border-[#25394d]/60">
                    <span className="text-stone-300">Sail forward</span>
                    <span className="font-mono font-bold text-amber-200">W / ↑</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-[#25394d]/60">
                    <span className="text-stone-300">Turn left / right</span>
                    <span className="font-mono font-bold text-amber-200">A / D (← →)</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-[#25394d]/60">
                    <span className="text-stone-300">Bow cannon</span>
                    <span className="font-mono font-bold text-amber-200">Space / K</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-[#25394d]/60">
                    <span className="text-stone-300">Port / Starboard broadsides</span>
                    <span className="font-mono font-bold text-amber-200">Q / E (J / L)</span>
                  </div>
                </>
              )}
            </div>

            <PirateButton
              variant="secondary"
              size={isDesktop ? 'md' : 'xs'}
              onClick={() => setShowControlsInline(false)}
              className={isDesktop ? 'w-[200px] h-[48px] text-sm' : 'w-[125px] xs:w-[145px] h-[32px] xs:h-[36px] text-[10px] xs:text-[11px]'}
            >
              BACK TO PAUSE
            </PirateButton>
          </div>
        )}
      </PiratePanel>
    </div>
  );
};
