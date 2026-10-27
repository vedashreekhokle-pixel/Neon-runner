import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/Engine';
import { GameSettings, GameState, GameStats } from './types/game';
import { HUD } from './components/HUD';
import { MainMenu } from './components/MainMenu';
import { PauseMenu } from './components/PauseMenu';
import { GameOverModal } from './components/GameOverModal';
import { TouchControls } from './components/TouchControls';
import { SettingsModal } from './components/SettingsModal';
import { GAME_CONSTANTS } from './game/constants';

export default function App() {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('MENU');
  const [showSettings, setShowSettings] = useState(false);
  const [nearMissAlert, setNearMissAlert] = useState<string | null>(null);
  const nearMissTimeoutRef = useRef<number | null>(null);

  const [stats, setStats] = useState<GameStats>({
    score: 0,
    distance: 0,
    crystals: 0,
    speed: GAME_CONSTANTS.INITIAL_SPEED,
    multiplier: 1,
    highScore: 0,
    nearMisses: 0,
  });

  const [settings, setSettings] = useState<GameSettings>(() => {
    const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    return {
      musicVolume: 0.65,
      sfxVolume: 0.85,
      graphicsQuality: 'HIGH',
      showTouchControls: isTouch,
      reducedMotion: false,
    };
  });

  // Near miss notification
  const handleNearMiss = useCallback((text: string) => {
    setNearMissAlert(text);
    if (nearMissTimeoutRef.current) {
      window.clearTimeout(nearMissTimeoutRef.current);
    }
    nearMissTimeoutRef.current = window.setTimeout(() => {
      setNearMissAlert(null);
    }, 1200);
  }, []);

  // Initialize Engine
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    const engine = new GameEngine(canvasContainerRef.current, {
      onStatsUpdate: (newStats) => {
        setStats({ ...newStats });
      },
      onGameOver: (finalStats) => {
        setStats({ ...finalStats });
        setGameState('GAMEOVER');
      },
      onNearMiss: handleNearMiss,
    });

    engineRef.current = engine;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, [handleNearMiss]);

  // Touch Swipe Gesture Detection
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!engineRef.current || gameState !== 'PLAYING') return;
      if (e.changedTouches.length === 1) {
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        const deltaY = e.changedTouches[0].clientY - touchStartY;
        const deltaTime = Date.now() - touchStartTime;

        if (deltaTime < 350) {
          const absX = Math.abs(deltaX);
          const absY = Math.abs(deltaY);

          if (Math.max(absX, absY) > 30) {
            if (absX > absY) {
              if (deltaX > 0) {
                engineRef.current.moveRight();
              } else {
                engineRef.current.moveLeft();
              }
            } else {
              if (deltaY < 0) {
                engineRef.current.jump();
              } else {
                engineRef.current.slide();
              }
            }
          }
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameState]);

  // Actions
  const handleStartRun = () => {
    if (engineRef.current) {
      engineRef.current.startRun();
      setGameState('PLAYING');
    }
  };

  const handlePause = () => {
    if (engineRef.current) {
      const isPaused = engineRef.current.togglePause();
      setGameState(isPaused ? 'PAUSED' : 'PLAYING');
    }
  };

  const handleResume = () => {
    if (engineRef.current) {
      engineRef.current.togglePause();
      setGameState('PLAYING');
    }
  };

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.startRun();
      setGameState('PLAYING');
    }
  };

  const handleHome = () => {
    if (engineRef.current) {
      engineRef.current.reset();
      setGameState('MENU');
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={canvasContainerRef} className="absolute inset-0 w-full h-full" />

      {/* Subtle Cyberpunk Scanlines */}
      <div className="absolute inset-0 cyber-scanlines z-10 pointer-events-none" />

      {/* In-Game HUD */}
      {gameState === 'PLAYING' && (
        <HUD stats={stats} nearMissText={nearMissAlert} onPause={handlePause} />
      )}

      {/* Main Title Menu */}
      {gameState === 'MENU' && (
        <MainMenu
          highScore={stats.highScore}
          onStart={handleStartRun}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {/* Pause Menu */}
      {gameState === 'PAUSED' && (
        <PauseMenu
          onResume={handleResume}
          onRestart={handleRestart}
          onHome={handleHome}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {/* Game Over Screen */}
      {gameState === 'GAMEOVER' && (
        <GameOverModal
          stats={stats}
          onRestart={handleRestart}
          onHome={handleHome}
        />
      )}

      {/* Mobile Touch Controls */}
      {gameState === 'PLAYING' && settings.showTouchControls && (
        <TouchControls
          onLeft={() => engineRef.current?.moveLeft()}
          onRight={() => engineRef.current?.moveRight()}
          onJump={() => engineRef.current?.jump()}
          onSlide={() => engineRef.current?.slide()}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
