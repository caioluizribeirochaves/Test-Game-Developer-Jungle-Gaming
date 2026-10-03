import React from 'react';
import { PiratePanel } from '../components/PiratePanel';
import { PirateButton } from '../components/PirateButton';

export interface PauseModalProps {
  onResume: () => void;
  onOptions: () => void;
  onMainMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onOptions,
  onMainMenu,
}) => {
  return (
    <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <PiratePanel size="sm">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#fce79f] tracking-wider mb-1 drop-shadow-md">
          PAUSED
        </h2>
        <p className="text-xs text-[#c5ad83] mb-6 font-medium">Ready when you are.</p>

        <div className="flex flex-col gap-3 w-full items-center">
          <PirateButton variant="primary" size="md" onClick={onResume}>
            RESUME
          </PirateButton>

          <PirateButton variant="primary" size="md" onClick={onOptions}>
            OPTIONS
          </PirateButton>

          <PirateButton variant="primary" size="md" onClick={onMainMenu}>
            MAIN MENU
          </PirateButton>
        </div>
      </PiratePanel>
    </div>
  );
};
