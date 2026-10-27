import React from 'react';
import { GameStats } from '../types/game';
import { Pause, Zap, Flame, ShieldAlert, Award } from 'lucide-react';

interface HUDProps {
  stats: GameStats;
  nearMissText: string | null;
  onPause: () => void;
}

export const HUD: React.FC<HUDProps> = ({ stats, nearMissText, onPause }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6 z-20">
      {/* Top Telemetry Bar */}
      <div className="flex items-center justify-between gap-4">
        {/* Left: Distance & Speed */}
        <div className="flex items-center gap-3">
          <div className="bg-black/60 border border-cyan-500/40 rounded-xl px-4 py-2 backdrop-blur-md shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <div className="text-[10px] tracking-widest text-cyan-400/80 font-bold uppercase">
              Distance
            </div>
            <div className="text-xl md:text-2xl font-orbitron font-bold text-white tracking-wider">
              {stats.distance} <span className="text-xs text-cyan-400">M</span>
            </div>
          </div>

          <div className="bg-black/60 border border-cyan-500/30 rounded-xl px-4 py-2 backdrop-blur-md hidden sm:block">
            <div className="text-[10px] tracking-widest text-gray-400 font-bold uppercase flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-400" /> Velocity
            </div>
            <div className="text-xl font-orbitron font-bold text-cyan-300">
              {stats.speed} <span className="text-xs text-gray-400">KM/H</span>
            </div>
          </div>
        </div>

        {/* Center: Score & Combo Multiplier */}
        <div className="flex flex-col items-center">
          <div className="bg-black/70 border border-cyan-400/60 rounded-2xl px-6 py-2 backdrop-blur-md text-center shadow-[0_0_20px_rgba(0,240,255,0.25)]">
            <div className="text-[10px] tracking-[0.2em] text-cyan-300 font-bold uppercase">
              Score
            </div>
            <div className="text-2xl md:text-3xl font-orbitron font-black text-white neon-text-cyan tracking-wider">
              {stats.score.toLocaleString()}
            </div>
          </div>

          {stats.multiplier > 1 && (
            <div className="mt-1 px-3 py-0.5 rounded-full bg-gradient-to-r from-magenta-600 to-pink-500 text-[11px] font-orbitron font-black text-white tracking-widest animate-bounce shadow-[0_0_12px_rgba(255,0,127,0.7)]">
              {stats.multiplier}X MULTIPLIER
            </div>
          )}
        </div>

        {/* Right: Crystals & Pause */}
        <div className="flex items-center gap-3">
          <div className="bg-black/60 border border-pink-500/40 rounded-xl px-4 py-2 backdrop-blur-md shadow-[0_0_15px_rgba(255,0,127,0.2)] flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400/40 animate-pulse" />
            <div>
              <div className="text-[10px] tracking-widest text-pink-400/80 font-bold uppercase">
                Crystals
              </div>
              <div className="text-xl md:text-2xl font-orbitron font-bold text-pink-300">
                {stats.crystals}
              </div>
            </div>
          </div>

          <button
            onClick={onPause}
            className="pointer-events-auto bg-black/60 hover:bg-cyan-950/80 border border-cyan-500/50 hover:border-cyan-400 rounded-xl p-3 text-cyan-400 hover:text-white transition-all shadow-lg active:scale-95 cursor-pointer"
            title="Pause [P / ESC]"
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Near Miss / Bonus Alert Banner in Middle */}
      <div className="flex justify-center items-center h-20">
        {nearMissText && (
          <div className="animate-in fade-in zoom-in-90 duration-200 bg-gradient-to-r from-cyan-600/90 via-pink-600/90 to-purple-600/90 border-2 border-white/80 px-6 py-2 rounded-2xl shadow-[0_0_30px_rgba(0,240,255,0.8)] backdrop-blur-md">
            <span className="font-orbitron font-black text-lg md:text-xl text-white tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              ⚡ {nearMissText} ⚡
            </span>
          </div>
        )}
      </div>

      {/* Bottom Minimal Status Indicator (No occlusion of central action) */}
      <div className="flex justify-between items-end text-xs text-cyan-400/60 font-mono tracking-wider">
        <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-lg border border-cyan-500/20">
          <Award className="w-3.5 h-3.5 text-yellow-400" />
          <span>BEST: {stats.highScore.toLocaleString()}</span>
        </div>
        <div className="hidden sm:block bg-black/40 px-3 py-1 rounded-lg border border-cyan-500/20">
          [A/D] LANES • [W/SPACE] JUMP • [S] SLIDE • [P] PAUSE
        </div>
      </div>
    </div>
  );
};
