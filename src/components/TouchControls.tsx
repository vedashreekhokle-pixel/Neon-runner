import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';

interface TouchControlsProps {
  onLeft: () => void;
  onRight: () => void;
  onJump: () => void;
  onSlide: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onLeft,
  onRight,
  onJump,
  onSlide,
}) => {
  return (
    <div className="absolute inset-x-0 bottom-6 px-6 pointer-events-none z-20 flex justify-between items-end">
      {/* Directional Pad (Left & Right) */}
      <div className="flex gap-3 pointer-events-auto">
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onLeft();
          }}
          onClick={onLeft}
          className="w-16 h-16 rounded-2xl bg-black/70 active:bg-cyan-500/30 border-2 border-cyan-400/60 active:border-cyan-300 text-cyan-300 active:text-white flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.3)] active:scale-95 transition-transform backdrop-blur-md select-none touch-manipulation cursor-pointer"
          aria-label="Move Left"
        >
          <ArrowLeft className="w-8 h-8" />
        </button>

        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onRight();
          }}
          onClick={onRight}
          className="w-16 h-16 rounded-2xl bg-black/70 active:bg-cyan-500/30 border-2 border-cyan-400/60 active:border-cyan-300 text-cyan-300 active:text-white flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.3)] active:scale-95 transition-transform backdrop-blur-md select-none touch-manipulation cursor-pointer"
          aria-label="Move Right"
        >
          <ArrowRight className="w-8 h-8" />
        </button>
      </div>

      {/* Action Pad (Jump & Slide) */}
      <div className="flex gap-3 pointer-events-auto">
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onSlide();
          }}
          onClick={onSlide}
          className="w-16 h-16 rounded-2xl bg-black/70 active:bg-purple-500/30 border-2 border-purple-400/60 active:border-purple-300 text-purple-300 active:text-white flex flex-col items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)] active:scale-95 transition-transform backdrop-blur-md select-none touch-manipulation cursor-pointer"
          aria-label="Slide"
        >
          <ArrowDown className="w-7 h-7" />
          <span className="text-[9px] font-mono font-bold tracking-widest mt-[-2px]">SLIDE</span>
        </button>

        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onJump();
          }}
          onClick={onJump}
          className="w-16 h-16 rounded-2xl bg-black/70 active:bg-pink-500/30 border-2 border-pink-400/60 active:border-pink-300 text-pink-300 active:text-white flex flex-col items-center justify-center shadow-[0_0_20px_rgba(255,0,127,0.3)] active:scale-95 transition-transform backdrop-blur-md select-none touch-manipulation cursor-pointer"
          aria-label="Jump"
        >
          <ArrowUp className="w-7 h-7" />
          <span className="text-[9px] font-mono font-bold tracking-widest mt-[-2px]">JUMP</span>
        </button>
      </div>
    </div>
  );
};
