import React, { useEffect } from 'react';
import { RotateCcw, Home, Trophy, Zap, Flame, Award, Skull } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GameStats } from '../types/game';
import { soundManager } from '../audio/soundManager';

interface GameOverModalProps {
  stats: GameStats;
  onRestart: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ stats, onRestart, onHome }) => {
  const isNewHighScore = stats.score >= stats.highScore && stats.score > 0;

  useEffect(() => {
    if (isNewHighScore) {
      // Fire festive cyberpunk confetti burst
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00f0ff', '#ff007f', '#ffffff', '#ffd700'],
      });
    }

    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        soundManager.playButtonClick();
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isNewHighScore, onRestart]);

  return (
    <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-black/95 border-2 border-pink-500/60 rounded-3xl p-6 md:p-8 text-center shadow-[0_0_60px_rgba(255,0,127,0.4)] relative overflow-hidden">
        {/* Warning Glitch Header */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-pink-500/50 bg-pink-950/40 text-pink-400 text-xs font-mono tracking-widest mb-3">
          <Skull className="w-3.5 h-3.5" />
          NEURAL LINK DISCONNECTED
        </div>

        <h2 className="text-3xl md:text-4xl font-orbitron font-black text-white tracking-widest mb-1 neon-text-magenta">
          RUN TERMINATED
        </h2>
        <div className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-6">
          IMPACT DETECTED // TELEMETRY REPORT
        </div>

        {/* New Record Banner */}
        {isNewHighScore && (
          <div className="mb-6 py-2 px-4 rounded-xl bg-gradient-to-r from-yellow-500/20 via-pink-500/20 to-cyan-500/20 border border-yellow-400 text-yellow-300 font-orbitron font-bold text-sm tracking-widest flex items-center justify-center gap-2 animate-pulse shadow-[0_0_20px_rgba(255,215,0,0.3)]">
            <Trophy className="w-4 h-4 text-yellow-400" />
            ★ NEW HIGH SCORE RECORD! ★
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-8 text-left font-chakra">
          {/* Final Score */}
          <div className="col-span-2 bg-black/70 border border-cyan-500/40 rounded-2xl p-4 text-center">
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
              Final Score
            </div>
            <div className="text-3xl md:text-4xl font-orbitron font-black text-white neon-text-cyan tracking-wider">
              {stats.score.toLocaleString()}
            </div>
          </div>

          {/* Distance */}
          <div className="bg-cyan-950/30 border border-cyan-500/20 rounded-xl p-3">
            <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3 h-3 text-cyan-400" /> Distance
            </div>
            <div className="text-xl font-orbitron font-bold text-white">
              {stats.distance} <span className="text-xs text-cyan-400">M</span>
            </div>
          </div>

          {/* Crystals */}
          <div className="bg-pink-950/30 border border-pink-500/20 rounded-xl p-3">
            <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 text-pink-400" /> Crystals
            </div>
            <div className="text-xl font-orbitron font-bold text-pink-300">
              {stats.crystals}
            </div>
          </div>

          {/* Near Misses */}
          <div className="bg-purple-950/30 border border-purple-500/20 rounded-xl p-3">
            <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
              Near Misses
            </div>
            <div className="text-xl font-orbitron font-bold text-purple-300">
              {stats.nearMisses}
            </div>
          </div>

          {/* High Score Record */}
          <div className="bg-yellow-950/30 border border-yellow-500/20 rounded-xl p-3">
            <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3 h-3 text-yellow-400" /> All-Time Best
            </div>
            <div className="text-xl font-orbitron font-bold text-yellow-300">
              {stats.highScore.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 font-orbitron">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onRestart();
            }}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-cyan-500 hover:from-pink-400 hover:to-cyan-400 text-white font-black tracking-widest uppercase transition-all shadow-[0_0_30px_rgba(255,0,127,0.6)] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            RESTART RUN [SPACE]
          </button>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              onHome();
            }}
            className="w-full py-3 px-6 rounded-xl bg-black/60 hover:bg-gray-900 border border-gray-700 text-gray-400 hover:text-white font-bold tracking-wider uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};
