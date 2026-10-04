import React from 'react';
import { PiratePanel } from '../components/PiratePanel';
import { PirateButton } from '../components/PirateButton';
import { checkIsMobile } from '../hud/GameHUD';

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
  const isMobile = checkIsMobile();

  return (
    <div className="absolute inset-0 z-40 bg-black/55 backdrop-blur-[2.5px] flex items-center justify-center p-2 sm:p-4 select-none">
      <PiratePanel size="sm" className="max-h-[calc(100dvh-20px)]">
        <h2 className="text-base xs:text-lg sm:text-xl font-extrabold text-[#fce79f] tracking-wider mb-0.5 drop-shadow-md">
          {showControlsInline ? 'CONTROLS' : 'PAUSED'}
        </h2>
        <p className="text-[9.5px] xs:text-[10.5px] sm:text-xs text-[#c5ad83] mb-1.5 sm:mb-2.5 font-medium">
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
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2.5 w-full items-center justify-items-center mb-1 sm:mb-2">
              <PirateButton
                variant="primary"
                size="xs"
                onClick={onResume}
                className="w-[125px] xs:w-[145px] h-[34px] xs:h-[38px] text-[10px] xs:text-[11px]"
              >
                RESUME
              </PirateButton>

              <PirateButton
                variant="primary"
                size="xs"
                onClick={onOptions}
                className="w-[125px] xs:w-[145px] h-[34px] xs:h-[38px] text-[10px] xs:text-[11px]"
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
                className="w-[125px] xs:w-[145px] h-[34px] xs:h-[38px] text-[10px] xs:text-[11px]"
              >
                CONTROLS
              </PirateButton>

              <PirateButton
                variant="primary"
                size="xs"
                onClick={onMainMenu}
                className="w-[125px] xs:w-[145px] h-[34px] xs:h-[38px] text-[10px] xs:text-[11px]"
              >
                MAIN MENU
              </PirateButton>
            </div>

            <p className="text-[8.5px] xs:text-[9.5px] text-stone-400 mt-0.5 text-center">
              Leaving ends this battle without recording it.
            </p>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* Inline Controls View with Adaptive Mobile / Desktop Rows */}
            <div className="w-full flex flex-col gap-1 text-[9.5px] xs:text-[10.5px] mb-2 sm:mb-2.5">
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
                  <div className="flex justify-between items-center py-0.5 border-b border-[#25394d]/60">
                    <span className="text-stone-300">Sail forward</span>
                    <span className="font-mono text-amber-200">W / ↑</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-[#25394d]/60">
                    <span className="text-stone-300">Turn left / right</span>
                    <span className="font-mono text-amber-200">A / D (← →)</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-[#25394d]/60">
                    <span className="text-stone-300">Bow cannon</span>
                    <span className="font-mono text-amber-200">Space / K</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-[#25394d]/60">
                    <span className="text-stone-300">Port / Starboard broadsides</span>
                    <span className="font-mono text-amber-200">Q / E (J / L)</span>
                  </div>
                </>
              )}
            </div>

            <PirateButton
              variant="secondary"
              size="xs"
              onClick={() => setShowControlsInline(false)}
              className="w-[125px] xs:w-[145px] h-[32px] xs:h-[36px] text-[10px] xs:text-[11px]"
            >
              BACK TO PAUSE
            </PirateButton>
          </div>
        )}
      </PiratePanel>
    </div>
  );
};
