
import React from 'react';
import { ActiveEvent } from '../types';
import { EVENT_DETAILS } from '../constants';

interface HUDProps {
  health: number;
  wave: number;
  isWaveActive: boolean;
  isGameOver: boolean;
  gameSpeed: number;
  isAutoStart: boolean;
  onSetSpeed: (speed: number) => void;
  onToggleAuto: () => void;
  onStartWave: () => void;
  onReset: () => void;
  onOpenSettings: () => void;
  isGodMode: boolean;
  activeEvent?: ActiveEvent | null;
}

const HUD: React.FC<HUDProps> = ({ 
  health, 
  wave, 
  isWaveActive, 
  isGameOver, 
  gameSpeed, 
  isAutoStart,
  onSetSpeed,
  onToggleAuto,
  onStartWave,
  onReset,
  onOpenSettings,
  isGodMode,
  activeEvent
}) => {
  const eventCategory = activeEvent ? EVENT_DETAILS[activeEvent.type].category : 'neutral';
  const eventColorClass = eventCategory === 'good' ? 'bg-green-500/80 border-green-400 text-black' : 
                         eventCategory === 'bad' ? 'bg-red-500/80 border-red-400 text-white' : 
                         'bg-yellow-500/80 border-yellow-400 text-black';

  return (
    <div className="absolute top-0 right-0 p-6 flex flex-col items-end pointer-events-none w-full h-full">
      {/* Settings & Info Button (Top Left) */}
      <div className="absolute top-6 left-6 pointer-events-auto flex items-center gap-4">
        <button 
          onClick={onOpenSettings}
          className="group relative w-12 h-12 border border-green-500/30 bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-green-500 hover:border-green-500 transition-all"
        >
          <svg className="w-6 h-6 text-green-500 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div className="absolute left-14 hidden group-hover:block bg-black/90 border border-green-500 text-[10px] text-green-500 font-black uppercase px-2 py-1 whitespace-nowrap tracking-widest italic">System Settings</div>
        </button>
        
        {isGodMode && (
          <div className="px-3 py-1 border border-red-500 text-red-500 text-[10px] font-black uppercase animate-pulse shadow-[0_0_10px_rgba(255,0,0,0.5)]">
            GOD_MODE_ACTIVE
          </div>
        )}
      </div>

      {/* Top Stats */}
      <div className="flex gap-10 items-center pointer-events-auto bg-black/40 p-4 rounded-bl-xl border-l border-b border-green-500/20 backdrop-blur-sm">
        <div className="text-right">
          <div className="text-[10px] text-green-800 uppercase tracking-widest font-bold">Base Integrity</div>
          <div className="flex items-center gap-2">
            <div className="w-48 h-2 bg-green-900/30 border border-green-500/30 overflow-hidden">
               <div 
                className={`h-full transition-all duration-500 shadow-[0_0_10px_#39FF14] ${isGodMode ? 'bg-cyan-400' : 'bg-green-400'}`}
                style={{ width: `${health}%` }}
               />
            </div>
            <span className={`text-xl font-bold tabular-nums ${health < 30 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                {health}%
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] text-green-800 uppercase tracking-widest font-bold">Threat Level</div>
          <div className="text-3xl font-bold text-green-400">
            WAVE <span className="text-white">{wave}</span>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="mt-auto mb-8 flex flex-col items-center w-full pointer-events-none">
        <div className="flex gap-4 pointer-events-auto bg-black/80 border border-green-500/40 p-3 backdrop-blur-md rounded-lg shadow-2xl">
          <button
            onClick={onStartWave}
            disabled={isWaveActive || isGameOver}
            className={`px-6 py-2 font-bold uppercase text-xs transition-all border ${
              isWaveActive 
                ? 'border-gray-800 text-gray-700 cursor-not-allowed' 
                : 'border-green-500 bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-black'
            }`}
          >
            {isWaveActive ? 'Breach Active' : 'Initialize Next Wave'}
          </button>

          <button
            onClick={onToggleAuto}
            className={`px-4 py-2 font-bold uppercase text-[10px] transition-all border ${
              isAutoStart 
                ? 'bg-green-500 border-green-500 text-black shadow-[0_0_15px_#39FF14]' 
                : 'border-green-900 text-green-800 hover:border-green-500 hover:text-green-500'
            }`}
          >
            AUTO: {isAutoStart ? 'ON' : 'OFF'}
          </button>

          <div className="flex border border-green-900 overflow-hidden rounded">
            {[1, 2, 4].map(s => (
              <button
                key={s}
                onClick={() => onSetSpeed(s)}
                className={`px-4 py-2 font-bold text-[10px] transition-all ${
                  gameSpeed === s 
                    ? 'bg-green-500 text-black' 
                    : 'text-green-800 hover:bg-green-500/20'
                }`}
              >
                {s}X
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Status Notifications */}
      <div className="mt-4 flex flex-col items-end gap-2 max-w-sm">
        {activeEvent && (
          <div className={`border p-4 backdrop-blur-md animate-pulse pointer-events-auto shadow-2xl ${eventColorClass}`}>
            <h3 className="text-sm font-black uppercase tracking-widest border-b border-current mb-2 pb-1">SYSTEM EVENT: {activeEvent.name}</h3>
            <p className="text-[10px] leading-tight uppercase italic">{activeEvent.description}</p>
          </div>
        )}

        {isGameOver ? (
          <div className="bg-red-600/20 border border-red-500 p-6 backdrop-blur-md animate-pulse pointer-events-auto">
            <h1 className="text-red-500 text-3xl font-black uppercase tracking-tighter">System compromised</h1>
            <p className="text-sm text-red-400 mt-2 mb-4">Critical failure. All sectors lost.</p>
            <button 
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-black font-bold text-xs"
              onClick={onReset}
            >
              REBOOT SYSTEM
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-black/40 p-2 border border-green-500/10 backdrop-blur-sm rounded">
            <div className={`w-2 h-2 rounded-full ${isWaveActive ? 'bg-red-500 animate-ping' : 'bg-green-500'}`} />
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isWaveActive ? 'text-red-400' : 'text-green-500'}`}>
              {isWaveActive ? 'Direct Hack Detected' : 'Port Scanning...'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HUD;
