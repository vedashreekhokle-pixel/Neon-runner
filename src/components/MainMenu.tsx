import React, { useState } from 'react';
import { Play, Settings, HelpCircle, Zap, Shield, Flame, Trophy, Volume2 } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface MainMenuProps {
  highScore: number;
  onStart: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ highScore, onStart, onOpenSettings }) => {
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const handleStart = () => {
    soundManager.playButtonClick();
    onStart();
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/55 backdrop-blur-[2px]">
      <div className="w-full max-w-xl text-center flex flex-col items-center">
        {/* Sub-header badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-400/50 bg-cyan-950/60 text-cyan-300 text-xs font-mono tracking-[0.25em] mb-4 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          SYSTEM PROTOCOL // 2099 ACTIVE
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-orbitron font-black text-white tracking-wider mb-2 drop-shadow-[0_0_25px_rgba(0,240,255,0.7)]">
          NEON <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500">RUNNER</span>
        </h1>
        <div className="text-pink-400 font-chakra text-lg md:text-xl font-bold tracking-[0.35em] mb-8 neon-text-magenta uppercase">
          CYBER ESCAPE
        </div>

        {/* High Score Banner */}
        {highScore > 0 && (
          <div className="mb-6 flex items-center gap-2 px-5 py-2 rounded-xl bg-black/60 border border-yellow-500/40 text-yellow-300 font-orbitron text-sm tracking-widest shadow-[0_0_20px_rgba(255,200,0,0.2)]">
            <Trophy className="w-4 h-4 text-yellow-400" />
            RECORD SCORE: <span className="font-bold text-white">{highScore.toLocaleString()}</span>
          </div>
        )}

        {/* Mission Briefing Card */}
        <div className="w-full bg-black/75 border border-cyan-500/30 rounded-2xl p-5 mb-8 backdrop-blur-md text-left shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="text-xs font-mono text-cyan-400/80 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> Mission Briefing
          </div>
          <p className="text-gray-300 text-sm md:text-base leading-relaxed font-chakra">
            Navigate the high-voltage rooftop skyway at breakneck speeds. Jump over low obstacles, slide beneath lethal laser grids, dodge speeding hovercrafts, and gather energy crystals to multiply your score!
          </p>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-cyan-500/20 text-center">
            <div className="bg-cyan-950/40 rounded-lg p-2 border border-cyan-500/20">
              <div className="text-[10px] text-cyan-400 font-mono">LANES</div>
              <div className="text-sm font-bold text-white font-orbitron">A / D</div>
            </div>
            <div className="bg-cyan-950/40 rounded-lg p-2 border border-cyan-500/20">
              <div className="text-[10px] text-pink-400 font-mono">JUMP</div>
              <div className="text-sm font-bold text-white font-orbitron">SPACE / W</div>
            </div>
            <div className="bg-cyan-950/40 rounded-lg p-2 border border-cyan-500/20">
              <div className="text-[10px] text-purple-400 font-mono">SLIDE</div>
              <div className="text-sm font-bold text-white font-orbitron">S / DOWN</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
          <button
            onClick={handleStart}
            className="flex-1 py-4 px-8 rounded-xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-black font-orbitron font-black text-lg tracking-widest uppercase transition-all transform hover:scale-[1.03] active:scale-95 shadow-[0_0_35px_rgba(0,240,255,0.8)] cursor-pointer flex items-center justify-center gap-3"
          >
            <Play className="w-6 h-6 fill-black" />
            INITIALIZE RUN
          </button>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                soundManager.playButtonClick();
                setShowHowToPlay(true);
              }}
              className="p-4 rounded-xl bg-black/60 hover:bg-cyan-950/80 border border-cyan-500/50 hover:border-cyan-400 text-cyan-400 hover:text-white transition-all shadow-lg active:scale-95 cursor-pointer"
              title="How to Play"
            >
              <HelpCircle className="w-6 h-6" />
            </button>
            <button
              onClick={() => {
                soundManager.playButtonClick();
                onOpenSettings();
              }}
              className="p-4 rounded-xl bg-black/60 hover:bg-cyan-950/80 border border-cyan-500/50 hover:border-cyan-400 text-cyan-400 hover:text-white transition-all shadow-lg active:scale-95 cursor-pointer"
              title="Settings"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* How to Play Modal */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-black/95 border-2 border-cyan-500/60 rounded-2xl p-6 md:p-8 max-w-lg w-full text-left relative shadow-[0_0_40px_rgba(0,240,255,0.4)]">
            <h2 className="text-2xl font-orbitron font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="text-cyan-400 w-6 h-6" /> OPERATIONAL MANUAL
            </h2>

            <div className="space-y-4 text-gray-300 font-chakra text-sm">
              <div className="flex gap-3 items-start bg-cyan-950/30 p-3 rounded-xl border border-cyan-500/20">
                <span className="font-orbitron font-bold text-cyan-400 text-base min-w-[70px]">LANE DODGE:</span>
                <span>Press <strong className="text-white">A / D</strong> or <strong className="text-white">Left / Right Arrows</strong> to switch lanes quickly.</span>
              </div>
              <div className="flex gap-3 items-start bg-cyan-950/30 p-3 rounded-xl border border-cyan-500/20">
                <span className="font-orbitron font-bold text-pink-400 text-base min-w-[70px]">JUMP:</span>
                <span>Press <strong className="text-white">Space</strong> or <strong className="text-white">W / Up Arrow</strong> to leap over low hurdles and road gaps.</span>
              </div>
              <div className="flex gap-3 items-start bg-cyan-950/30 p-3 rounded-xl border border-cyan-500/20">
                <span className="font-orbitron font-bold text-purple-400 text-base min-w-[70px]">SLIDE:</span>
                <span>Press <strong className="text-white">S</strong> or <strong className="text-white">Down Arrow</strong> to slide under overhead laser grids and conduits.</span>
              </div>
              <div className="flex gap-3 items-start bg-cyan-950/30 p-3 rounded-xl border border-cyan-500/20">
                <span className="font-orbitron font-bold text-yellow-400 text-base min-w-[70px]">BULLET-TIME:</span>
                <span>Execute razor-sharp close shaves next to obstacles to trigger <strong>Bullet-Time Slow Motion</strong> and boost your multiplier!</span>
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.playButtonClick();
                setShowHowToPlay(false);
              }}
              className="mt-6 w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-orbitron font-bold tracking-wider cursor-pointer"
            >
              UNDERSTOOD // RETURN
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
