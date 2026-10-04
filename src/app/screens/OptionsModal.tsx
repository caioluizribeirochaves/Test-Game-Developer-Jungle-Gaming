import React from 'react';
import { PiratePanel } from '../components/PiratePanel';
import { PirateButton } from '../components/PirateButton';
import {
  MatchConfig,
  MATCH_CONFIG_LIMITS,
  DEFAULT_MATCH_CONFIG,
  saveStoredMatchConfig,
} from '@/engine/config/gameConfig';
import { getPlayerProfile, savePlayerProfile } from '@/api/outbox';
import { AudioManager } from '@/engine/audio/AudioManager';

export interface OptionsModalProps {
  currentConfig: MatchConfig;
  onSaveConfig: (updated: MatchConfig) => void;
  onClose: () => void;
  isInGame?: boolean;
}

export const OptionsModal: React.FC<OptionsModalProps> = ({
  currentConfig,
  onSaveConfig,
  onClose,
  isInGame = false,
}) => {
  const [sessionDuration, setSessionDuration] = React.useState(currentConfig.sessionDuration);
  const [enemySpawnInterval, setEnemySpawnInterval] = React.useState(
    currentConfig.enemySpawnInterval
  );
  const [captainName, setCaptainName] = React.useState(() => getPlayerProfile().name);
  const [soundEnabled, setSoundEnabled] = React.useState(() => !AudioManager.getInstance().getMuted());
  const [savedFeedback, setSavedFeedback] = React.useState(false);

  const handleDurationChange = (delta: number) => {
    setSessionDuration((prev) =>
      Math.max(
        MATCH_CONFIG_LIMITS.minDuration,
        Math.min(MATCH_CONFIG_LIMITS.maxDuration, prev + delta)
      )
    );
  };

  const handleSpawnChange = (delta: number) => {
    // 0.5s step support as specified in Image 2
    setEnemySpawnInterval((prev) => {
      const next = Math.round((prev + delta) * 10) / 10;
      return Math.max(
        MATCH_CONFIG_LIMITS.minSpawnInterval,
        Math.min(MATCH_CONFIG_LIMITS.maxSpawnInterval, next)
      );
    });
  };

  const handleToggleSound = () => {
    const isMuted = AudioManager.getInstance().toggleMute();
    setSoundEnabled(!isMuted);
  };

  const handleSave = () => {
    const updated: MatchConfig = {
      sessionDuration,
      enemySpawnInterval,
    };
    saveStoredMatchConfig(updated);
    savePlayerProfile({ name: captainName.trim() || 'Captain Jack' });
    onSaveConfig(updated);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const handleRestoreDefaults = () => {
    setSessionDuration(DEFAULT_MATCH_CONFIG.sessionDuration);
    setEnemySpawnInterval(DEFAULT_MATCH_CONFIG.enemySpawnInterval);
    setCaptainName('Captain Jack');
    if (AudioManager.getInstance().getMuted()) {
      AudioManager.getInstance().toggleMute();
      setSoundEnabled(true);
    }
  };

  return (
    <div
      className={
        isInGame
          ? 'absolute inset-0 z-50 bg-black/55 backdrop-blur-[2.5px] flex flex-col items-center justify-center overflow-x-hidden overflow-y-auto p-4 sm:p-6'
          : 'relative w-full h-full flex flex-col items-center justify-center overflow-x-hidden overflow-y-auto p-4 sm:p-6 select-none'
      }
    >
      {!isInGame && (
        <>
          {/* Subtle darkened and slightly blurred background scene for high contrast focus */}
          <div
            className="absolute inset-0 bg-cover bg-center filter blur-[2.5px] scale-105 pointer-events-none"
            style={{ backgroundImage: 'url(/assets/ui_scene_background.png)' }}
          />
          <div className="absolute inset-0 bg-black/35 pointer-events-none" />
        </>
      )}

      <PiratePanel size="md" className="z-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#fce79f] tracking-wider mb-5 drop-shadow-md">
          OPTIONS
        </h2>

        {/* 1. Setting: Game session time */}
        <div className="w-full flex flex-col items-center mb-4">
          <label className="text-xs sm:text-sm font-bold text-[#f7edd2] uppercase tracking-wider mb-2">
            Game session time
          </label>
          <div className="flex items-center gap-4">
            <PirateButton
              variant="round"
              size="md"
              icon="minus"
              onClick={() => handleDurationChange(-MATCH_CONFIG_LIMITS.durationStep)}
              disabled={sessionDuration <= MATCH_CONFIG_LIMITS.minDuration}
              aria-label="Decrease session duration"
            >
              −
            </PirateButton>

            <div className="w-28 text-center text-lg sm:text-xl font-black text-[#fce79f] bg-black/50 py-1.5 rounded-xl border border-[#9b6f1e] shadow-inner font-mono">
              {sessionDuration} s
            </div>

            <PirateButton
              variant="round"
              size="md"
              icon="plus"
              onClick={() => handleDurationChange(MATCH_CONFIG_LIMITS.durationStep)}
              disabled={sessionDuration >= MATCH_CONFIG_LIMITS.maxDuration}
              aria-label="Increase session duration"
            >
              +
            </PirateButton>
          </div>
          <span className="text-[11px] text-stone-400 mt-1">
            60-180 seconds of active play.
          </span>
        </div>

        {/* 2. Setting: Enemy spawn time */}
        <div className="w-full flex flex-col items-center mb-4">
          <label className="text-xs sm:text-sm font-bold text-[#f7edd2] uppercase tracking-wider mb-2">
            Enemy spawn time
          </label>
          <div className="flex items-center gap-4">
            <PirateButton
              variant="round"
              size="md"
              icon="minus"
              onClick={() => handleSpawnChange(-0.5)}
              disabled={enemySpawnInterval <= MATCH_CONFIG_LIMITS.minSpawnInterval}
              aria-label="Decrease spawn interval"
            >
              −
            </PirateButton>

            <div className="w-28 text-center text-lg sm:text-xl font-black text-[#fce79f] bg-black/50 py-1.5 rounded-xl border border-[#9b6f1e] shadow-inner font-mono">
              {enemySpawnInterval} s
            </div>

            <PirateButton
              variant="round"
              size="md"
              icon="plus"
              onClick={() => handleSpawnChange(0.5)}
              disabled={enemySpawnInterval >= MATCH_CONFIG_LIMITS.maxSpawnInterval}
              aria-label="Increase spawn interval"
            >
              +
            </PirateButton>
          </div>
          <span className="text-[11px] text-stone-400 mt-1">
            1-10 seconds between enemy ships, in 0.5 s steps.
          </span>
        </div>

        {/* 3. Setting: Captain name */}
        <div className="w-full flex flex-col items-center mb-3">
          <label className="text-xs sm:text-sm font-bold text-[#f7edd2] uppercase tracking-wider mb-2">
            Captain name
          </label>
          <input
            type="text"
            value={captainName}
            onChange={(e) => setCaptainName(e.target.value)}
            className="w-full max-w-[260px] bg-[#0c1825] border-2 border-[#385675] focus:border-[#dfa837] rounded-xl px-4 py-2 text-center text-sm font-bold text-amber-200 shadow-inner outline-none transition-colors"
            placeholder="Captain Jack"
            maxLength={20}
          />
        </div>

        {/* 4. Setting: Sound effects checkbox */}
        <div className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            id="sound-effects-toggle"
            checked={soundEnabled}
            onChange={handleToggleSound}
            className="w-4 h-4 rounded border-stone-500 text-amber-500 focus:ring-amber-400 cursor-pointer accent-amber-500"
          />
          <label
            htmlFor="sound-effects-toggle"
            className="text-xs sm:text-sm font-bold text-[#f7edd2] cursor-pointer"
          >
            Sound effects
          </label>
        </div>

        <p className="text-[10px] text-stone-400 mb-4 text-center">
          Changes apply to your next battle.
        </p>

        {/* Feedback message when saved */}
        {savedFeedback && (
          <div className="text-xs text-emerald-400 font-bold mb-3 animate-bounce text-center">
            Options saved. They will be applied on your next battle
          </div>
        )}

        {/* Row of Action Buttons: SAVE and DEFAULTS */}
        <div className="flex items-center gap-3 mb-3 w-full justify-center">
          <PirateButton variant="primary" size="sm" onClick={handleSave}>
            SAVE
          </PirateButton>

          <PirateButton variant="secondary" size="sm" onClick={handleRestoreDefaults}>
            DEFAULTS
          </PirateButton>
        </div>

        {/* Bottom Navigation Button */}
        <PirateButton variant="primary" size="md" onClick={onClose}>
          {isInGame ? 'BACK' : 'MAIN MENU'}
        </PirateButton>
      </PiratePanel>
    </div>
  );
};
