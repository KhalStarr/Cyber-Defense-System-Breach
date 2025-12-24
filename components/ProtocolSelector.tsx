
import React from 'react';
import { Difficulty } from '../types';
import { DIFFICULTY_CONFIG, THEME } from '../constants';

interface ProtocolSelectorProps {
  onSelect: (difficulty: Difficulty) => void;
}

const ProtocolSelector: React.FC<ProtocolSelectorProps> = ({ onSelect }) => {
  return (
    <div className="absolute inset-0 z-[150] bg-black flex items-center justify-center p-6 overflow-y-auto">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black text-white italic tracking-tighter mb-2">AUTHORIZE_PROTOCOL</h1>
          <p className="text-green-500/60 uppercase tracking-widest text-xs font-bold">Select environment parameters for security simulation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(Object.keys(Difficulty) as Array<keyof typeof Difficulty>).map((key) => {
            const diff = Difficulty[key];
            const cfg = DIFFICULTY_CONFIG[diff];
            
            return (
              <button
                key={diff}
                onClick={() => onSelect(diff)}
                className="group relative bg-black border border-green-500/20 p-8 text-left hover:border-green-500 hover:bg-green-500/5 transition-all duration-300 overflow-hidden"
              >
                {/* Background Decor */}
                <div className="absolute -right-10 -bottom-10 w-40 h-40 border-t border-l border-green-500/10 group-hover:border-green-500/30 rotate-12 transition-all" />
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-black text-green-400 group-hover:text-white transition-colors tracking-tight italic uppercase">
                      {cfg.name}
                    </h2>
                    <div className="w-8 h-8 border border-green-500/30 flex items-center justify-center text-[10px] text-green-600 font-bold">
                      0{Object.keys(Difficulty).indexOf(key) + 1}
                    </div>
                  </div>

                  <p className="text-sm text-green-700 font-medium italic mb-6 leading-relaxed">
                    "{cfg.description}"
                  </p>

                  <div className="grid grid-cols-2 gap-y-3 gap-x-6 border-t border-green-500/10 pt-6">
                    <div className="space-y-1">
                      <span className="block text-[10px] text-green-900 uppercase font-black">Architecture</span>
                      <span className="text-xs text-green-400 font-bold">{cfg.dualPath ? 'Dual Parallel Paths' : 'Linear Single Path'}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[10px] text-green-900 uppercase font-black">Economic Yield</span>
                      <span className="text-xs text-green-400 font-bold">{cfg.bountyMult * 100}% Bounties</span>
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[10px] text-green-900 uppercase font-black">Event Severity</span>
                      <span className="text-xs text-green-400 font-bold">{cfg.eventPool.join(' | ').toUpperCase()}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[10px] text-green-900 uppercase font-black">Downtime</span>
                      <span className="text-xs text-green-400 font-bold">{(cfg.waveCooldown/1000).toFixed(1)}s Sync</span>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 h-1 bg-green-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left w-full" />
              </button>
            );
          })}
        </div>

        <div className="mt-12 p-4 border border-red-500/20 bg-red-500/5 text-center">
          <p className="text-[10px] text-red-500/60 font-black uppercase tracking-[0.3em] italic animate-pulse">
            Warning: Selection finalizes environmental variables. No mid-cycle decryption permitted.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProtocolSelector;
