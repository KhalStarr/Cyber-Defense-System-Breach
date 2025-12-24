
import React from 'react';
import { EnemyType } from '../types';
import { ENEMIES } from '../constants';
import EnemyIcon from './EnemyIcon';

interface DatabaseProps {
  onClose: () => void;
  globalContamination?: number;
}

const Database: React.FC<DatabaseProps> = ({ onClose, globalContamination = 0 }) => {
  const isHeavilyCorrupted = globalContamination > 60;

  const glitchText = (text: string) => {
    if (!isHeavilyCorrupted) return text;
    return text.split('').map(char => Math.random() > 0.8 ? '█' : char).join('');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 pointer-events-none">
      <div className={`w-full max-w-4xl h-[80vh] bg-black/95 border-2 backdrop-blur-2xl pointer-events-auto flex flex-col shadow-[0_0_100px_rgba(57,255,20,0.2)] transition-colors duration-1000 ${isHeavilyCorrupted ? 'border-[#bc13fe] shadow-[0_0_100px_rgba(188,19,254,0.3)]' : 'border-green-500/50'}`}>
        <div className={`p-6 border-b flex justify-between items-center ${isHeavilyCorrupted ? 'border-[#bc13fe]/30 bg-[#bc13fe]/5' : 'border-green-500/30 bg-green-500/5'}`}>
          <div>
            <h2 className={`text-2xl font-black italic tracking-tighter uppercase ${isHeavilyCorrupted ? 'text-[#bc13fe] animate-pulse' : 'text-green-400'}`}>
              {isHeavilyCorrupted ? 'UNAUTHORIZED_ACCESS_intel' : 'Threat Database_'}
            </h2>
            <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isHeavilyCorrupted ? 'text-[#bc13fe]/60' : 'text-green-700'}`}>
              {isHeavilyCorrupted ? 'MEM_DUMP_RECOVERED' : 'System Intelligence & Malware Analysis'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className={`w-10 h-10 border flex items-center justify-center transition-all font-bold ${isHeavilyCorrupted ? 'border-[#bc13fe] text-[#bc13fe] hover:bg-[#bc13fe] hover:text-black' : 'border-green-500/30 text-green-500 hover:bg-green-500 hover:text-black'}`}
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-none">
          {(Object.keys(ENEMIES) as EnemyType[]).map((type) => {
            const cfg = ENEMIES[type];
            return (
              <div key={type} className={`group border p-4 flex gap-6 items-center transition-all ${isHeavilyCorrupted ? 'border-[#bc13fe]/10 hover:bg-[#bc13fe]/5' : 'border-green-500/10 hover:bg-green-500/5'}`}>
                <div className={`shrink-0 w-24 h-24 flex items-center justify-center bg-black border transition-all ${isHeavilyCorrupted ? 'border-[#bc13fe]/20 group-hover:border-[#bc13fe]/60' : 'border-green-500/10 group-hover:border-green-500/40'}`}>
                  <EnemyIcon type={type} size={64} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className={`text-lg font-bold uppercase italic tracking-wider ${isHeavilyCorrupted ? 'text-[#bc13fe]' : 'text-white'}`}>
                      {glitchText(type.replace('_', ' '))}
                    </h3>
                  </div>
                  <p className={`text-xs leading-relaxed font-medium mb-3 italic ${isHeavilyCorrupted ? 'text-[#bc13fe]/60' : 'text-green-500/70'}`}>
                    {isHeavilyCorrupted ? "DATA_REWRITTEN_BY_CORE: This pattern is part of us now." : cfg.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Database;
