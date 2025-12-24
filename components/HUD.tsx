import React from 'react';
import { ActiveEvent } from '../types';
import { EVENT_DETAILS, THEME } from '../constants';

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
  contamination?: number;
  isBlacksite?: boolean;
}

const HUD: React.FC<HUDProps> = ({ 
  health, wave, isWaveActive, isGameOver, gameSpeed, isAutoStart, onSetSpeed, onToggleAuto, onStartWave, onReset, onOpenSettings, isGodMode, activeEvent, contamination = 0, isBlacksite = false
}) => {
  const isHeavilyCorrupted = isBlacksite && contamination > 50;
  
  // UX Requirement: Cold communication
  const healthLabel = isHeavilyCorrupted ? "KERNEL_DRIFT_THRESHOLD" : (isBlacksite ? "SECTOR_COHERENCE" : "Base Integrity");
  const waveLabel = isHeavilyCorrupted ? "PHASE_DETECTION" : "Wave";

  return (
    <div className="absolute top-0 right-0 p-3 md:p-6 flex flex-col items-end pointer-events-none w-full h-full">
      <div className="absolute top-3 left-3 md:top-6 md:left-6 pointer-events-auto flex items-center gap-2">
        <button onClick={onOpenSettings} className={`group w-10 h-10 border bg-black/40 flex items-center justify-center transition-all ${isBlacksite ? 'border-[#bc13fe]/30 hover:bg-[#bc13fe]' : 'border-green-500/30 hover:bg-green-500'}`}>
          <svg className="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </button>
        {isBlacksite && (
          <div className={`px-2 py-0.5 border text-[8px] font-black uppercase transition-all ${isHeavilyCorrupted ? 'border-red-600 text-red-600 animate-pulse bg-red-600/10' : 'border-[#bc13fe] text-[#bc13fe]'}`}>
            {isHeavilyCorrupted ? 'FATAL_CORE_CONTAMINATION_ACTIVE' : 'Blacksite Protocol Active'}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 items-end pointer-events-auto bg-black/60 p-3 md:p-4 border-l border-b border-white/10 backdrop-blur-sm rounded-bl-xl">
        <div className="text-right flex flex-col items-end">
          <div className={`text-[8px] uppercase font-black ${isHeavilyCorrupted ? 'text-red-900' : (isBlacksite ? 'text-[#bc13fe]' : 'text-green-800')}`}>
            {healthLabel}
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-24 md:w-48 h-1 border transition-all ${isBlacksite ? 'bg-[#bc13fe]/10 border-[#bc13fe]/30' : 'bg-green-900/30 border-green-500/30'}`}>
              <div className={`h-full transition-all ${isBlacksite ? 'bg-[#bc13fe]' : 'bg-green-400'}`} style={{ width: `${health}%` }} />
            </div>
            <span className={`text-sm md:text-xl font-bold ${isBlacksite ? 'text-[#bc13fe]' : 'text-green-400'}`}>{health}%</span>
          </div>
        </div>

        {isBlacksite && (
          <div className="text-right flex flex-col items-end mt-1">
            <div className={`text-[8px] uppercase font-black ${isHeavilyCorrupted ? 'text-red-500 animate-pulse' : 'text-[#bc13fe]/60'}`}>
              System Contamination (ENV)
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 md:w-48 h-1 bg-[#bc13fe]/10 border border-[#bc13fe]/30">
                <div className="h-full bg-[#bc13fe] transition-all shadow-[0_0_10px_#bc13fe]" style={{ width: `${contamination}%` }} />
              </div>
              <span className={`text-[10px] font-bold ${contamination > 60 ? 'text-red-500' : 'text-[#bc13fe]'}`}>{contamination.toFixed(1)}%</span>
            </div>
          </div>
        )}

        <div className="text-right">
          <div className={`text-lg md:text-2xl font-bold uppercase ${isHeavilyCorrupted ? 'text-red-600' : (isBlacksite ? 'text-[#bc13fe]' : 'text-green-400')}`}>
            {waveLabel} {wave}
          </div>
        </div>
      </div>

      <div className="mt-auto mb-4 flex flex-col items-center w-full pointer-events-none">
        <div className={`flex gap-2 md:gap-4 pointer-events-auto bg-black/90 border p-2 md:p-3 backdrop-blur-md rounded-lg ${isBlacksite ? 'border-[#bc13fe]/40 shadow-[0_0_30px_rgba(188,19,254,0.15)]' : 'border-green-500/40'}`}>
          <button onClick={onStartWave} disabled={isWaveActive || isGameOver} className={`px-4 py-2 font-black uppercase text-[10px] border ${isWaveActive ? 'border-gray-800 text-gray-700' : isBlacksite ? 'border-[#bc13fe] text-[#bc13fe] hover:bg-[#bc13fe] hover:text-black' : 'border-green-500 text-green-400'}`}>{isWaveActive ? (isHeavilyCorrupted ? 'OVERRUN' : 'Running') : (isHeavilyCorrupted ? 'FORCE_START' : 'Authorize')}</button>
          <button onClick={onToggleAuto} className={`px-3 py-2 font-black uppercase text-[8px] border ${isAutoStart ? (isBlacksite ? 'bg-[#bc13fe] text-black' : 'bg-green-500 text-black') : 'border-white/10 text-white/40'}`}>Auto: {isAutoStart ? 'On' : 'Off'}</button>
        </div>
      </div>
    </div>
  );
};

export default HUD;
