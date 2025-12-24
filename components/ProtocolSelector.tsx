
import React, { useState } from 'react';
import { Difficulty } from '../types';
import { DIFFICULTY_CONFIG, THEME } from '../constants';

interface ProtocolSelectorProps {
  onSelect: (difficulty: Difficulty, isBlacksite: boolean) => void;
}

const ProtocolSelector: React.FC<ProtocolSelectorProps> = ({ onSelect }) => {
  const [isBlacksite, setIsBlacksite] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [selectedDiff, setSelectedDiff] = useState<Difficulty | null>(null);

  const handleToggleBlacksite = () => {
    if (!isBlacksite) {
      setShowConsent(true);
    } else {
      setIsBlacksite(false);
    }
  };

  const confirmBlacksite = () => {
    setIsBlacksite(true);
    setShowConsent(false);
  };

  const abortBlacksite = () => {
    setIsBlacksite(false);
    setShowConsent(false);
  };

  const handleDiffSelect = (diff: Difficulty) => {
    // Check Ground Rule: Lock Blacksite to Hard+
    const isHardPlus = diff === Difficulty.HARD || diff === Difficulty.NIGHTMARE;
    if (isBlacksite && !isHardPlus) {
      alert("BLACKSITE_PROTOCOL REQUIRES MINIMUM_HARD_CLEARANCE. Override failed.");
      return;
    }
    onSelect(diff, isBlacksite);
  };

  return (
    <div className={`absolute inset-0 z-[150] bg-black flex items-start md:items-center justify-center p-4 md:p-6 overflow-y-auto transition-colors duration-1000 ${isBlacksite ? 'bg-[#0a000a]' : 'bg-black'}`}>
      <div className="max-w-5xl w-full py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-12 gap-4">
          <div className="text-center md:text-left">
            <h1 className={`text-4xl md:text-6xl font-black italic tracking-tighter mb-2 transition-colors ${isBlacksite ? 'text-[#bc13fe] shadow-[0_0_20px_rgba(188,19,254,0.4)]' : 'text-white'}`}>
              {isBlacksite ? 'BLACKSITE_PROTOCOL' : 'AUTHORIZE_PROTOCOL'}
            </h1>
            <p className={`uppercase tracking-widest text-[8px] md:text-xs font-bold ${isBlacksite ? 'text-[#bc13fe]' : 'text-green-500/60'}`}>
              Security Simulation Configuration
            </p>
          </div>

          <div className="bg-black/40 p-4 border border-white/10 backdrop-blur-md rounded-lg flex flex-col items-end">
            <div className="text-[10px] text-white/40 uppercase mb-2 font-black tracking-widest">System Override</div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={isBlacksite} onChange={handleToggleBlacksite} className="sr-only peer" />
              <div className="w-14 h-7 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#bc13fe]"></div>
              <span className={`ml-3 text-xs font-bold uppercase ${isBlacksite ? 'text-[#bc13fe] animate-pulse' : 'text-gray-500'}`}>Blacksite</span>
            </label>
            {isBlacksite && <div className="text-[8px] text-[#bc13fe] mt-2 font-bold animate-pulse">LOCK: HARD+ ONLY</div>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {(Object.keys(Difficulty) as Array<keyof typeof Difficulty>).map((key) => {
            const diff = Difficulty[key];
            const cfg = DIFFICULTY_CONFIG[diff];
            const isLocked = isBlacksite && !(diff === Difficulty.HARD || diff === Difficulty.NIGHTMARE);
            const colorClass = isLocked 
              ? 'border-gray-900 opacity-20 grayscale cursor-not-allowed'
              : isBlacksite 
                ? 'border-[#bc13fe]/30 hover:border-[#bc13fe] hover:bg-[#bc13fe]/5 text-[#bc13fe]' 
                : 'border-green-500/20 hover:border-green-500 hover:bg-green-500/5 text-green-400';
            
            return (
              <button
                key={diff}
                disabled={isLocked}
                onClick={() => handleDiffSelect(diff)}
                className={`group relative bg-black border p-4 md:p-8 text-left transition-all duration-300 overflow-hidden ${colorClass}`}
              >
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2 md:mb-4">
                    <h2 className={`text-lg md:text-2xl font-black group-hover:text-white transition-colors uppercase italic`}>
                      {isLocked ? 'CLEARANCE_REQUIRED' : cfg.name}
                    </h2>
                    <div className={`w-6 h-6 md:w-8 md:h-8 border flex items-center justify-center text-[8px] md:text-[10px] font-bold ${isBlacksite ? 'border-[#bc13fe]/40 text-[#bc13fe]' : 'border-green-500/30 text-green-600'}`}>
                      0{Object.keys(Difficulty).indexOf(key) + 1}
                    </div>
                  </div>
                  <p className={`text-xs md:text-sm italic mb-4 md:mb-6 line-clamp-2 ${isBlacksite ? 'text-[#bc13fe]/60' : 'text-green-700'}`}>"{cfg.description}"</p>
                  <div className={`grid grid-cols-2 gap-2 md:gap-y-3 md:gap-x-6 border-t pt-4 md:pt-6 ${isBlacksite ? 'border-[#bc13fe]/10' : 'border-green-500/10'}`}>
                    <div className="space-y-0.5">
                      <span className={`block text-[8px] md:text-[10px] uppercase font-black ${isBlacksite ? 'text-[#bc13fe]/40' : 'text-green-900'}`}>Pathing</span>
                      <span className="text-[10px] md:text-xs font-bold">{cfg.dualPath ? 'Parallel' : 'Linear'}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className={`block text-[8px] md:text-[10px] uppercase font-black ${isBlacksite ? 'text-[#bc13fe]/40' : 'text-green-900'}`}>Yield</span>
                      <span className="text-[10px] md:text-xs font-bold">{cfg.bountyMult * 100}%</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {showConsent && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="max-w-xl w-full border-2 border-[#bc13fe] bg-black p-8 md:p-12 shadow-[0_0_100px_rgba(188,19,254,0.3)]">
            <div className="text-center space-y-6">
              <h2 className="text-[#bc13fe] text-[10px] font-black tracking-[0.4em] uppercase">Unauthorized Protocol Expansion</h2>
              <h1 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
                RESTRICTED_ACCESS: BLACKSITE PROTOCOL
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed italic border-y border-[#bc13fe]/20 py-6">
                "WARNING: Experimental security protocols introduces kernel corruption mechanics and irreversible behavioral mutations. System visuals will be desaturated. Blacksite only functions on HARD clearnece or higher."
              </p>
              <div className="flex flex-col gap-3 pt-4">
                <button 
                  onClick={confirmBlacksite}
                  className="w-full py-4 bg-[#bc13fe] text-black font-black uppercase tracking-widest hover:bg-white transition-colors italic"
                >
                  Authorize DLC Protocol
                </button>
                <button 
                  onClick={abortBlacksite}
                  className="w-full py-3 border border-white/20 text-white/40 font-bold uppercase text-[10px] hover:text-white transition-colors"
                >
                  Abort Operation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProtocolSelector;
