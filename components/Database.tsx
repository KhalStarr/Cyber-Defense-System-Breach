
import React from 'react';
import { EnemyType } from '../types';
import { ENEMIES } from '../constants';
import EnemyIcon from './EnemyIcon';

interface DatabaseProps {
  onClose: () => void;
}

const Database: React.FC<DatabaseProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 pointer-events-none">
      <div className="w-full max-w-4xl h-[80vh] bg-black/95 border-2 border-green-500/50 backdrop-blur-2xl pointer-events-auto flex flex-col shadow-[0_0_100px_rgba(57,255,20,0.2)]">
        <div className="p-6 border-b border-green-500/30 flex justify-between items-center bg-green-500/5">
          <div>
            <h2 className="text-2xl font-black text-green-400 italic tracking-tighter uppercase">Threat Database_</h2>
            <p className="text-[10px] text-green-700 font-bold uppercase tracking-widest mt-1">System Intelligence & Malware Analysis</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 border border-green-500/30 flex items-center justify-center text-green-500 hover:bg-green-500 hover:text-black transition-all font-bold"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-green-900 scrollbar-track-transparent">
          {(Object.keys(ENEMIES) as EnemyType[]).map((type) => {
            const cfg = ENEMIES[type];
            return (
              <div key={type} className="group border border-green-500/10 p-4 flex gap-6 items-center hover:bg-green-500/5 hover:border-green-500/30 transition-all">
                <div className="shrink-0 w-24 h-24 flex items-center justify-center bg-black border border-green-500/10 group-hover:border-green-500/40 group-hover:shadow-[0_0_15px_rgba(57,255,20,0.1)] transition-all">
                  <EnemyIcon type={type} size={64} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-white uppercase italic tracking-wider">{type.replace('_', ' ')}</h3>
                    <div className="px-2 py-0.5 border border-green-900 text-[8px] font-black text-green-800 uppercase rounded">Class: {type === EnemyType.ZERO_DAY ? 'Apex' : 'Malware'}</div>
                  </div>
                  <p className="text-xs text-green-500/70 leading-relaxed font-medium mb-3 italic">
                    {cfg.description}
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-[9px] font-mono">
                      <span className="text-green-900 uppercase block">Integ:</span>
                      <span className="text-green-400 font-bold">{cfg.hp} HP</span>
                    </div>
                    <div className="text-[9px] font-mono">
                      <span className="text-green-900 uppercase block">Velo:</span>
                      <span className="text-green-400 font-bold">{(cfg.speed * 1000).toFixed(0)} MHz</span>
                    </div>
                    <div className="text-[9px] font-mono">
                      <span className="text-green-900 uppercase block">Yield:</span>
                      <span className="text-green-400 font-bold">${cfg.bounty} CR</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-green-500/20 bg-black text-[9px] text-green-900 font-bold uppercase flex justify-between italic">
          <span>Encrypted connection established...</span>
          <span>Access Level: Admin</span>
        </div>
      </div>
    </div>
  );
};

export default Database;
