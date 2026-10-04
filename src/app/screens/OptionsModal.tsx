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
import { useDeviceLayout } from '../hooks/useDeviceLayout';

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
  const { isDesktop } = useDeviceLayout();

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
          ? 'absolute inset-0 z-50 bg-black/55 backdrop-blur-[2.5px] flex flex-col items-center justify-center overflow-hidden p-1.5 xs:p-2 sm:p-4 select-none'
          : 'relative w-full h-full flex flex-col items-center justify-center overflow-hidden p-1.5 xs:p-2 sm:p-4 select-none'
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

      {/* DESKTOP FULL-SIZE OPTIONS PANEL */}
      {isDesktop ? (
        <PiratePanel size="md" className="z-10 max-h-[92dvh] overflow-y-auto custom-scrollbar p-3 sm:p-5">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#fce79f] tracking-wider mb-4 drop-shadow-md">
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
          <div className="flex items-center gap-5 sm:gap-6 mb-4 w-full justify-center">
            <PirateButton variant="primary" size="sm" onClick={handleSave} className="w-[145px] sm:w-[160px] h-[42px] sm:h-[48px] text-xs sm:text-sm">
              SAVE
            </PirateButton>

            <PirateButton variant="secondary" size="sm" onClick={handleRestoreDefaults} className="w-[145px] sm:w-[160px] h-[42px] sm:h-[48px] text-xs sm:text-sm">
              DEFAULTS
            </PirateButton>
          </div>

          {/* Bottom Navigation Button */}
          <PirateButton variant="primary" size="md" onClick={onClose}>
            {isInGame ? 'BACK' : 'MAIN MENU'}
          </PirateButton>
        </PiratePanel>
      ) : (
        /* MOBILE COMPACT ADAPTIVE PANEL */
        <PiratePanel size="lg" className="z-10 max-h-[calc(100dvh-16px)]">
          <h2 className="text-sm xs:text-base sm:text-xl font-extrabold text-[#fce79f] tracking-wider mb-1 drop-shadow-md">
            OPTIONS
          </h2>

          {/* 2-Column Responsive Grid on Landscape; Single Column on Portrait */}
          <div className="w-full grid grid-cols-1 landscape:grid-cols-2 sm:grid-cols-2 gap-x-4 gap-y-1.5 sm:gap-y-2.5 items-center mb-1 sm:mb-2">
            {/* Column 1: Game session time */}
            <div className="flex flex-col items-center">
              <label className="text-[9.5px] xs:text-[10.5px] sm:text-xs font-bold text-[#f7edd2] uppercase tracking-wider mb-0.5">
                Game session time
              </label>
              <div className="flex items-center gap-2">
                <PirateButton
                  variant="round"
                  size="xs"
                  icon="minus"
                  onClick={() => handleDurationChange(-MATCH_CONFIG_LIMITS.durationStep)}
                  disabled={sessionDuration <= MATCH_CONFIG_LIMITS.minDuration}
                  aria-label="Decrease session duration"
                >
                  −
                </PirateButton>

                <div className="w-18 xs:w-20 text-center text-xs xs:text-sm font-black text-[#fce79f] bg-black/50 py-0.5 rounded-lg border border-[#9b6f1e] shadow-inner font-mono">
                  {sessionDuration} s
                </div>

                <PirateButton
                  variant="round"
                  size="xs"
                  icon="plus"
                  onClick={() => handleDurationChange(MATCH_CONFIG_LIMITS.durationStep)}
                  disabled={sessionDuration >= MATCH_CONFIG_LIMITS.maxDuration}
                  aria-label="Increase session duration"
                >
                  +
                </PirateButton>
              </div>
              <span className="text-[8px] xs:text-[9px] text-stone-400 mt-0.5">
                60-180 seconds active play.
              </span>
            </div>

            {/* Column 2: Enemy spawn time */}
            <div className="flex flex-col items-center">
              <label className="text-[9.5px] xs:text-[10.5px] sm:text-xs font-bold text-[#f7edd2] uppercase tracking-wider mb-0.5">
                Enemy spawn time
              </label>
              <div className="flex items-center gap-2">
                <PirateButton
                  variant="round"
                  size="xs"
                  icon="minus"
                  onClick={() => handleSpawnChange(-0.5)}
                  disabled={enemySpawnInterval <= MATCH_CONFIG_LIMITS.minSpawnInterval}
                  aria-label="Decrease spawn interval"
                >
                  −
                </PirateButton>

                <div className="w-18 xs:w-20 text-center text-xs xs:text-sm font-black text-[#fce79f] bg-black/50 py-0.5 rounded-lg border border-[#9b6f1e] shadow-inner font-mono">
                  {enemySpawnInterval} s
                </div>

                <PirateButton
                  variant="round"
                  size="xs"
                  icon="plus"
                  onClick={() => handleSpawnChange(0.5)}
                  disabled={enemySpawnInterval >= MATCH_CONFIG_LIMITS.maxSpawnInterval}
                  aria-label="Increase spawn interval"
                >
                  +
                </PirateButton>
              </div>
              <span className="text-[8px] xs:text-[9px] text-stone-400 mt-0.5">
                1-10s between enemy ships.
              </span>
            </div>

            {/* Column 1 Row 2: Captain name */}
            <div className="flex flex-col items-center">
              <label className="text-[9.5px] xs:text-[10.5px] sm:text-xs font-bold text-[#f7edd2] uppercase tracking-wider mb-0.5">
                Captain name
              </label>
              <input
                type="text"
                value={captainName}
                onChange={(e) => setCaptainName(e.target.value)}
                className="w-full max-w-[170px] xs:max-w-[190px] h-[26px] xs:h-[28px] bg-[#0c1825] border border-[#385675] focus:border-[#dfa837] rounded-lg px-2 text-center text-[11px] xs:text-xs font-bold text-amber-200 shadow-inner outline-none transition-colors"
                placeholder="Captain Jack"
                maxLength={20}
              />
            </div>

            {/* Column 2 Row 2: Sound effects toggle */}
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 py-0.5">
                <input
                  type="checkbox"
                  id="sound-effects-toggle"
                  checked={soundEnabled}
                  onChange={handleToggleSound}
                  className="w-3.5 h-3.5 rounded border-stone-500 text-amber-500 focus:ring-amber-400 cursor-pointer accent-amber-500"
                />
                <label
                  htmlFor="sound-effects-toggle"
                  className="text-[9.5px] xs:text-[10.5px] sm:text-xs font-bold text-[#f7edd2] cursor-pointer"
                >
                  Sound effects
                </label>
              </div>
              <span className="text-[8px] xs:text-[8.5px] text-stone-400">
                Changes apply to next battle.
              </span>
            </div>
          </div>

          {/* Feedback message when saved */}
          {savedFeedback && (
            <div className="text-[9px] xs:text-[10px] text-emerald-400 font-bold mb-1 animate-pulse text-center">
              Options saved! Applied on next battle.
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col landscape:flex-row sm:flex-row items-center justify-center gap-1.5 xs:gap-2 sm:gap-3 w-full mt-1 sm:mt-2">
            <div className="flex items-center gap-1.5 xs:gap-2">
              <PirateButton
                variant="primary"
                size="xs"
                onClick={handleSave}
                className="w-[88px] xs:w-[100px] sm:w-[115px] h-[28px] xs:h-[32px] sm:h-[36px] text-[8.5px] xs:text-[9.5px] sm:text-[10px]"
              >
                SAVE
              </PirateButton>

              <PirateButton
                variant="secondary"
                size="xs"
                onClick={handleRestoreDefaults}
                className="w-[88px] xs:w-[100px] sm:w-[115px] h-[28px] xs:h-[32px] sm:h-[36px] text-[8px] xs:text-[9px] sm:text-[9.5px]"
              >
                DEFAULTS
              </PirateButton>
            </div>

            <PirateButton
              variant="primary"
              size="xs"
              onClick={onClose}
              className="w-[125px] xs:w-[140px] sm:w-[135px] h-[28px] xs:h-[32px] sm:h-[36px] text-[8.5px] xs:text-[9.5px] sm:text-[10px]"
            >
              {isInGame ? 'BACK' : 'MAIN MENU'}
            </PirateButton>
          </div>
        </PiratePanel>
      )}
    </div>
  );
};
