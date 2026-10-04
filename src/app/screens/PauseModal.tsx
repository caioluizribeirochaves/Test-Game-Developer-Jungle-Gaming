import React from 'react';
import { PiratePanel } from '../components/PiratePanel';
import { PirateButton } from '../components/PirateButton';

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

  return (
    <div className="absolute inset-0 z-40 bg-black/55 backdrop-blur-[2.5px] flex items-center justify-center p-2 sm:p-4 select-none">
      <PiratePanel size="sm" className="max-h-[calc(100dvh-20px)]">
        <h2 className="text-lg xs:text-xl sm:text-2xl font-extrabold text-[#fce79f] tracking-wider mb-0.5 drop-shadow-md">
          PAUSED
        </h2>
        <p className="text-[10px] xs:text-xs text-[#c5ad83] mb-2 sm:mb-3 font-medium">
          {isBlurTriggered ? 'Paused because the game lost focus.' : 'Ready when you are.'}
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

            <p className="text-[8.5px] xs:text-[9.5px] text-stone-400 mt-1 text-center">
              Leaving ends this battle without recording it.
            </p>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* Inline Controls View */}
            <div className="w-full flex flex-col gap-1.5 text-xs mb-4">
              <div className="flex justify-between py-1 border-b border-[#25394d]">
                <span className="text-stone-300">Sail forward</span>
                <span className="font-mono text-amber-200">W / ↑</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#25394d]">
                <span className="text-stone-300">Turn left / right</span>
                <span className="font-mono text-amber-200">A / D (← →)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#25394d]">
                <span className="text-stone-300">Bow cannon</span>
                <span className="font-mono text-amber-200">Space / K</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#25394d]">
                <span className="text-stone-300">Port / Starboard broadsides</span>
                <span className="font-mono text-amber-200">Q / E (J / L)</span>
              </div>
            </div>

            <PirateButton variant="secondary" size="md" onClick={() => setShowControlsInline(false)}>
              BACK TO PAUSE
            </PirateButton>
          </div>
        )}
      </PiratePanel>
    </div>
  );
};
