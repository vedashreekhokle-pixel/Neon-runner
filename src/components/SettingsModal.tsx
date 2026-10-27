import React from 'react';
import { Volume2, VolumeX, Smartphone, Monitor, Eye, X } from 'lucide-react';
import { GameSettings } from '../types/game';
import { soundManager } from '../audio/soundManager';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const handleMusicChange = (val: number) => {
    soundManager.setMusicVolume(val);
    onUpdateSettings({ ...settings, musicVolume: val });
  };

  const handleSfxChange = (val: number) => {
    soundManager.setSfxVolume(val);
    onUpdateSettings({ ...settings, sfxVolume: val });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-black/95 border-2 border-cyan-500/60 rounded-3xl p-6 md:p-8 relative shadow-[0_0_50px_rgba(0,240,255,0.35)]">
        {/* Close Button */}
        <button
          onClick={() => {
            soundManager.playButtonClick();
            onClose();
          }}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-2xl font-orbitron font-bold text-white mb-6 flex items-center gap-2">
          SYSTEM CONFIGURATION
        </h3>

        <div className="space-y-6 font-chakra">
          {/* Synthwave Music Volume */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-gray-200 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                CYBER SYNTH MUSIC
              </label>
              <span className="text-cyan-400 font-mono text-xs">
                {Math.round(settings.musicVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.musicVolume}
              onChange={(e) => handleMusicChange(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 h-2 bg-gray-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* SFX Volume */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-gray-200 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-pink-400" />
                FX AUDIO SYNTHESIS
              </label>
              <span className="text-pink-400 font-mono text-xs">
                {Math.round(settings.sfxVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.sfxVolume}
              onChange={(e) => handleSfxChange(parseFloat(e.target.value))}
              className="w-full accent-pink-500 h-2 bg-gray-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Touch Controls Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-800">
            <div>
              <div className="text-sm font-bold text-gray-200 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-purple-400" />
                TOUCH CONTROLS OVERLAY
              </div>
              <div className="text-xs text-gray-400">Display on-screen d-pad & jump/slide pads</div>
            </div>
            <button
              onClick={() => {
                soundManager.playButtonClick();
                onUpdateSettings({ ...settings, showTouchControls: !settings.showTouchControls });
              }}
              className={`px-4 py-1.5 rounded-xl font-orbitron text-xs font-bold transition-all cursor-pointer ${
                settings.showTouchControls
                  ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              {settings.showTouchControls ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          {/* Reduced Motion Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-800">
            <div>
              <div className="text-sm font-bold text-gray-200 flex items-center gap-2">
                <Eye className="w-4 h-4 text-yellow-400" />
                REDUCED MOTION
              </div>
              <div className="text-xs text-gray-400">Tone down camera shake & FOV warping</div>
            </div>
            <button
              onClick={() => {
                soundManager.playButtonClick();
                onUpdateSettings({ ...settings, reducedMotion: !settings.reducedMotion });
              }}
              className={`px-4 py-1.5 rounded-xl font-orbitron text-xs font-bold transition-all cursor-pointer ${
                settings.reducedMotion
                  ? 'bg-yellow-500 text-black shadow-[0_0_12px_rgba(255,215,0,0.5)]'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              {settings.reducedMotion ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            soundManager.playButtonClick();
            onClose();
          }}
          className="mt-8 w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-orbitron font-bold tracking-wider cursor-pointer"
        >
          CONFIRM CONFIGURATION
        </button>
      </div>
    </div>
  );
};
