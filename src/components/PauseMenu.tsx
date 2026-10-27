import React from 'react';
import { Play, RotateCcw, Home, Settings } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  onOpenSettings: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestart,
  onHome,
  onOpenSettings,
}) => {
  return (
    <div className="absolute inset-0 z-40 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-black/90 border-2 border-cyan-500/60 rounded-3xl p-8 text-center shadow-[0_0_50px_rgba(0,240,255,0.35)] relative overflow-hidden">
        {/* Decorative corner accents */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

        <div className="text-xs font-mono text-cyan-400/80 uppercase tracking-[0.3em] mb-2">
          SYSTEM HOLD // STATE FROZEN
        </div>
        <h2 className="text-3xl font-orbitron font-black text-white tracking-widest mb-8 drop-shadow-[0_0_15px_rgba(0,240,255,0.6)]">
          PAUSED
        </h2>

        <div className="flex flex-col gap-3 font-orbitron">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onResume();
            }}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-black font-bold tracking-widest uppercase transition-all shadow-[0_0_25px_rgba(0,240,255,0.5)] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-black" />
            RESUME RUN
          </button>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              onRestart();
            }}
            className="w-full py-3 px-6 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 hover:text-white font-bold tracking-wider uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            RESTART
          </button>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              onOpenSettings();
            }}
            className="w-full py-3 px-6 rounded-xl bg-black/60 hover:bg-gray-900/80 border border-gray-700/60 text-gray-300 hover:text-white font-bold tracking-wider uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <Settings className="w-4 h-4" />
            SETTINGS
          </button>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              onHome();
            }}
            className="w-full py-3 px-6 rounded-xl bg-black/60 hover:bg-gray-900/80 border border-gray-700/60 text-gray-400 hover:text-white font-bold tracking-wider uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};
