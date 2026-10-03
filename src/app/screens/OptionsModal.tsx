import React from 'react';
import { PiratePanel } from '../components/PiratePanel';
import { PirateButton } from '../components/PirateButton';
import {
  MatchConfig,
  MATCH_CONFIG_LIMITS,
  saveStoredMatchConfig,
} from '@/engine/config/gameConfig';

export interface OptionsModalProps {
  currentConfig: MatchConfig;
  onSaveConfig: (updated: MatchConfig) => void;
  onClose: () => void;
}

export const OptionsModal: React.FC<OptionsModalProps> = ({
  currentConfig,
  onSaveConfig,
  onClose,
}) => {
  const [sessionDuration, setSessionDuration] = React.useState(currentConfig.sessionDuration);
  const [enemySpawnInterval, setEnemySpawnInterval] = React.useState(
    currentConfig.enemySpawnInterval
  );

  const handleDurationChange = (delta: number) => {
    setSessionDuration((prev) =>
      Math.max(
        MATCH_CONFIG_LIMITS.minDuration,
        Math.min(MATCH_CONFIG_LIMITS.maxDuration, prev + delta)
      )
    );
  };

  const handleSpawnChange = (delta: number) => {
    setEnemySpawnInterval((prev) =>
      Math.max(
        MATCH_CONFIG_LIMITS.minSpawnInterval,
        Math.min(MATCH_CONFIG_LIMITS.maxSpawnInterval, prev + delta)
      )
    );
  };

  const handleSaveAndBack = () => {
    const updated: MatchConfig = {
      sessionDuration,
      enemySpawnInterval,
    };
    saveStoredMatchConfig(updated);
    onSaveConfig(updated);
    onClose();
  };

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: 'url(/assets/ui_scene_background.png)' }}
    >
      <PiratePanel size="md">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#fce79f] tracking-wider mb-6 drop-shadow-md">
          OPTIONS
        </h2>

        {/* Setting 1: Game session time */}
        <div className="w-full flex flex-col items-center mb-6">
          <label className="text-xs sm:text-sm font-semibold text-[#f7edd2] uppercase tracking-wider mb-3">
            Game session time
          </label>
          <div className="flex items-center gap-4">
            <PirateButton
              variant="round"
              size="md"
              onClick={() => handleDurationChange(-MATCH_CONFIG_LIMITS.durationStep)}
              disabled={sessionDuration <= MATCH_CONFIG_LIMITS.minDuration}
              aria-label="Decrease session duration"
            >
              −
            </PirateButton>

            <div className="w-28 text-center text-lg sm:text-xl font-black text-[#fce79f] bg-black/40 py-2 rounded-xl border border-[#9b6f1e] shadow-inner font-mono">
              {sessionDuration} s
            </div>

            <PirateButton
              variant="round"
              size="md"
              onClick={() => handleDurationChange(MATCH_CONFIG_LIMITS.durationStep)}
              disabled={sessionDuration >= MATCH_CONFIG_LIMITS.maxDuration}
              aria-label="Increase session duration"
            >
              +
            </PirateButton>
          </div>
          <span className="text-[10px] text-stone-400 mt-1">
            Range: {MATCH_CONFIG_LIMITS.minDuration}s – {MATCH_CONFIG_LIMITS.maxDuration}s
          </span>
        </div>

        {/* Setting 2: Enemy spawn time */}
        <div className="w-full flex flex-col items-center mb-8">
          <label className="text-xs sm:text-sm font-semibold text-[#f7edd2] uppercase tracking-wider mb-3">
            Enemy spawn time
          </label>
          <div className="flex items-center gap-4">
            <PirateButton
              variant="round"
              size="md"
              onClick={() => handleSpawnChange(-MATCH_CONFIG_LIMITS.spawnIntervalStep)}
              disabled={enemySpawnInterval <= MATCH_CONFIG_LIMITS.minSpawnInterval}
              aria-label="Decrease spawn interval"
            >
              −
            </PirateButton>

            <div className="w-28 text-center text-lg sm:text-xl font-black text-[#fce79f] bg-black/40 py-2 rounded-xl border border-[#9b6f1e] shadow-inner font-mono">
              {enemySpawnInterval} s
            </div>

            <PirateButton
              variant="round"
              size="md"
              onClick={() => handleSpawnChange(MATCH_CONFIG_LIMITS.spawnIntervalStep)}
              disabled={enemySpawnInterval >= MATCH_CONFIG_LIMITS.maxSpawnInterval}
              aria-label="Increase spawn interval"
            >
              +
            </PirateButton>
          </div>
          <span className="text-[10px] text-stone-400 mt-1">
            Range: {MATCH_CONFIG_LIMITS.minSpawnInterval}s – {MATCH_CONFIG_LIMITS.maxSpawnInterval}s
          </span>
        </div>

        {/* Back / Save Button */}
        <PirateButton variant="primary" size="md" onClick={handleSaveAndBack}>
          MAIN MENU
        </PirateButton>
      </PiratePanel>
    </div>
  );
};
