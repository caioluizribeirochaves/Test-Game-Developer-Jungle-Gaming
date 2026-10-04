import React, { useEffect, useRef, useState } from 'react';
import { AssetLoader } from '@/engine/core/AssetLoader';
import { GameEngine } from '@/engine/core/GameEngine';
import {
  MatchConfig,
  loadStoredMatchConfig,
  saveStoredMatchConfig,
} from '@/engine/config/gameConfig';
import { MatchRecord, EndReason } from '@/api/types';
import { getPlayerProfile, getLastMatchResult } from '@/api/outbox';
import { useRecordMatchMutation, useSyncPendingMatches } from '@/api/queries';

import { MainMenu } from './screens/MainMenu';
import { OptionsModal } from './screens/OptionsModal';
import { PauseModal } from './screens/PauseModal';
import { ResultModal } from './screens/ResultModal';
import { CaptainsLogModal } from './screens/CaptainsLogModal';
import { GameHUD } from './hud/GameHUD';
import { NetworkSimulatorModal } from './dev/NetworkSimulatorModal';
import { PiratePanel } from './components/PiratePanel';

export type ScreenState = 'LOADING' | 'MENU' | 'PLAYING' | 'OPTIONS' | 'LOG' | 'RESULT';

export const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenState>('LOADING');
  const [loadProgress, setLoadProgress] = useState(0);

  // Snapshot Configuration
  const [config, setConfig] = useState<MatchConfig>(loadStoredMatchConfig);

  // In-Game Live HUD State (driven by GameEngine events)
  const [health, setHealth] = useState(100);
  const [maxHealth, setMaxHealth] = useState(100);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [isPaused, setIsPaused] = useState(false);

  // Modals & Panels
  const [logInitialTab, setLogInitialTab] = useState<'ranking' | 'history'>('ranking');
  const [isChaosOpen, setIsChaosOpen] = useState(false);
  const [isPauseOptionsOpen, setIsPauseOptionsOpen] = useState(false);

  // Last Completed Match Result & Sync State
  const [lastMatch, setLastMatch] = useState<MatchRecord | null>(getLastMatchResult);
  const [syncStatus, setSyncStatus] = useState<
    'idle' | 'pending' | 'success' | 'offline_queued' | 'error'
  >('idle');

  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);

  const recordMatchMutation = useRecordMatchMutation();
  const syncPendingMutation = useSyncPendingMatches();

  // 1. Initial Asset Loading
  useEffect(() => {
    let isMounted = true;
    AssetLoader.getInstance()
      .loadAll((ratio) => {
        if (isMounted) setLoadProgress(ratio);
      })
      .then(() => {
        if (isMounted) {
          // Attempt syncing any pending offline matches on app launch
          syncPendingMutation.mutate();
          setScreen('MENU');
        }
      })
      .catch((err) => {
        console.error('Failed to load assets', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Keyboard shortcut for Network Simulator (Ctrl+Shift+D or Alt+D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.shiftKey && e.code === 'KeyD') || (e.altKey && e.code === 'KeyD')) {
        e.preventDefault();
        setIsChaosOpen((prev) => !prev);
      }
      if (e.code === 'Escape' && screen === 'PLAYING') {
        if (isPauseOptionsOpen) {
          setIsPauseOptionsOpen(false);
        } else {
          gameEngineRef.current?.togglePause();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, isPauseOptionsOpen]);

  // 3. Start Game Session
  const startGame = () => {
    setIsPauseOptionsOpen(false);
    setScreen('PLAYING');
    setIsPaused(false);
  };

  // 4. Mount PixiJS Canvas when entering PLAYING screen
  useEffect(() => {
    if (screen !== 'PLAYING') {
      if (gameEngineRef.current) {
        gameEngineRef.current.destroy();
        gameEngineRef.current = null;
      }
      return;
    }

    if (!canvasContainerRef.current) return;

    // Create GameEngine instance with active snapshot of configuration
    const engine = new GameEngine(config, {
      onHealthChange: (curr, max) => {
        setHealth(curr);
        setMaxHealth(max);
      },
      onScoreChange: (newScore) => {
        setScore(newScore);
      },
      onTimeChange: (remaining) => {
        setTimeRemaining(remaining);
      },
      onPauseChange: (paused) => {
        setIsPaused(paused);
      },
      onGameOver: (reason: EndReason, finalScore: number, finalDuration: number) => {
        handleGameOver(reason, finalScore, finalDuration);
      },
    });

    gameEngineRef.current = engine;
    engine.initialize(canvasContainerRef.current);

    return () => {
      engine.destroy();
      gameEngineRef.current = null;
    };
  }, [screen]);

  // 5. Handle Match Completion
  const handleGameOver = (reason: EndReason, finalScore: number, finalDuration: number) => {
    const player = getPlayerProfile();
    const matchId = `match_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const matchRecord: MatchRecord = {
      id: matchId,
      playerId: player.id,
      playerName: player.name,
      date: new Date().toISOString(),
      score: finalScore,
      duration: finalDuration,
      reason,
      config: { ...config },
    };

    setLastMatch(matchRecord);
    setSyncStatus('pending');
    setScreen('RESULT');

    // Submit via TanStack Query mutation
    recordMatchMutation.mutate(matchRecord, {
      onSuccess: (res) => {
        if (res.offline) {
          setSyncStatus('offline_queued');
        } else {
          setSyncStatus('success');
        }
      },
      onError: () => {
        setSyncStatus('error');
      },
    });
  };

  const handleRetrySync = () => {
    if (!lastMatch) return;
    setSyncStatus('pending');
    recordMatchMutation.mutate(lastMatch, {
      onSuccess: (res) => {
        if (res.offline) {
          setSyncStatus('offline_queued');
        } else {
          setSyncStatus('success');
        }
      },
      onError: () => {
        setSyncStatus('error');
      },
    });
  };

  return (
    <div className="relative w-full h-full min-h-full max-h-full overflow-hidden select-none bg-[#0c1724] flex flex-col">
      {/* 1. Loading Screen */}
      {screen === 'LOADING' && (
        <div className="relative w-full h-full min-h-full max-h-full flex flex-col items-center justify-center overflow-hidden p-2 sm:p-4 select-none bg-[#0c1724]">
          {/* Subtle darkened and slightly blurred background scene for high contrast focus */}
          <div
            className="absolute inset-0 bg-cover bg-center filter blur-[2.5px] scale-105 pointer-events-none"
            style={{ backgroundImage: 'url(/assets/ui_scene_background.png)' }}
          />
          {/* Slight dark overlay for contrast */}
          <div className="absolute inset-0 bg-black/35 pointer-events-none" />

          <PiratePanel size="sm" className="my-auto z-10 max-w-[340px] xs:max-w-[380px]">
            <h1 className="text-lg xs:text-xl sm:text-2xl font-black text-[#fce79f] tracking-wider mb-1 sm:mb-2 text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              HOISTING SAILS...
            </h1>
            <p className="text-[10px] xs:text-xs text-[#c5ad83] mb-4 sm:mb-6 text-center font-medium tracking-wide">
              Preparing pirate waters and cannons
            </p>
            {/* Loading Bar */}
            <div className="w-full h-5 xs:h-6 bg-[#122438] rounded-full border-2 border-[#9b6f1e] p-0.5 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-[#dfa837] to-[#fce79f] rounded-full transition-all duration-300"
                style={{ width: `${Math.round(loadProgress * 100)}%` }}
              />
            </div>
            <span className="text-[11px] xs:text-xs text-amber-200 mt-2 font-mono font-bold">
              {Math.round(loadProgress * 100)}%
            </span>
          </PiratePanel>
        </div>
      )}

      {/* 2. Main Menu */}
      {screen === 'MENU' && (
        <MainMenu
          onPlay={startGame}
          onOptions={() => setScreen('OPTIONS')}
          onOpenLog={(tab) => {
            setLogInitialTab(tab);
            setScreen('LOG');
          }}
          onOpenChaosSimulator={() => setIsChaosOpen(true)}
        />
      )}

      {/* 3. Options Modal / Screen */}
      {screen === 'OPTIONS' && (
        <OptionsModal
          currentConfig={config}
          onSaveConfig={(updated) => {
            setConfig(updated);
            saveStoredMatchConfig(updated);
          }}
          onClose={() => setScreen('MENU')}
        />
      )}

      {/* 4. Captain's Log (Ranking & Match History) */}
      {screen === 'LOG' && (
        <CaptainsLogModal
          initialTab={logInitialTab}
          config={config}
          onClose={() => setScreen('MENU')}
        />
      )}

      {/* 5. In-Game Battle Arena & HUD */}
      {screen === 'PLAYING' && (
        <div className="relative w-full h-full">
          {/* PixiJS Canvas Container */}
          <div ref={canvasContainerRef} className="w-full h-full absolute inset-0 z-0" />

          {/* Interactive Game HUD */}
          <GameHUD
            health={health}
            maxHealth={maxHealth}
            score={score}
            timeRemaining={timeRemaining}
            onTogglePause={() => gameEngineRef.current?.togglePause()}
            onVirtualInput={(action, value) =>
              gameEngineRef.current?.setVirtualInput(action, value)
            }
            onJoystickInput={(x, y, active) =>
              gameEngineRef.current?.setJoystickInput(x, y, active)
            }
          />

          {/* Pause Modal Overlay */}
          {isPaused && !isPauseOptionsOpen && (
            <PauseModal
              onResume={() => gameEngineRef.current?.resumeGame()}
              onOptions={() => {
                setIsPauseOptionsOpen(true);
              }}
              onMainMenu={() => {
                // Leaving combat abandons the active match (per README)
                setIsPauseOptionsOpen(false);
                setScreen('MENU');
              }}
            />
          )}

          {/* In-Game Options Overlay (keeps paused game scene visible underneath) */}
          {isPaused && isPauseOptionsOpen && (
            <OptionsModal
              isInGame={true}
              currentConfig={config}
              onSaveConfig={(updated) => {
                setConfig(updated);
                saveStoredMatchConfig(updated);
              }}
              onClose={() => {
                setIsPauseOptionsOpen(false);
              }}
            />
          )}
        </div>
      )}

      {/* 6. Battle Result Screen */}
      {screen === 'RESULT' && lastMatch && (
        <ResultModal
          record={lastMatch}
          syncStatus={syncStatus}
          onRetrySync={handleRetrySync}
          onPlayAgain={startGame}
          onMainMenu={() => setScreen('MENU')}
        />
      )}

      {/* 7. Network / MSW Chaos Simulator Modal */}
      {isChaosOpen && <NetworkSimulatorModal onClose={() => setIsChaosOpen(false)} />}
    </div>
  );
};
