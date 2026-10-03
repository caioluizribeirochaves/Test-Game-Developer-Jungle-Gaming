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
    <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <PiratePanel size="sm">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#fce79f] tracking-wider mb-1 drop-shadow-md">
          PAUSED
        </h2>
        <p className="text-xs text-[#c5ad83] mb-5 font-medium">
          {isBlurTriggered ? 'Paused because the game lost focus.' : 'Ready when you are.'}
        </p>

        {!showControlsInline ? (
          <div className="flex flex-col gap-3 w-full items-center">
            <PirateButton variant="primary" size="md" onClick={onResume}>
              RESUME
            </PirateButton>

            <PirateButton variant="primary" size="md" onClick={onOptions}>
              OPTIONS
            </PirateButton>

            <PirateButton
              variant="primary"
              size="md"
              onClick={() => {
                if (onControls) onControls();
                else setShowControlsInline(true);
              }}
            >
              CONTROLS
            </PirateButton>

            <PirateButton variant="primary" size="md" onClick={onMainMenu}>
              MAIN MENU
            </PirateButton>

            <p className="text-[10px] text-stone-400 mt-2 text-center">
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

            <PirateButton variant="secondary" size="sm" onClick={() => setShowControlsInline(false)}>
              BACK TO PAUSE
            </PirateButton>
          </div>
        )}
      </PiratePanel>
    </div>
  );
};
