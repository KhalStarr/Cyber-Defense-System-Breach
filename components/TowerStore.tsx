
import React from 'react';
import { TOWERS, MAX_TOWER_LEVEL, THEME } from '../constants';
import { TowerType, TowerInstance, Difficulty } from '../types';

interface TowerStoreProps {
  credits: number;
  onSelectTower: (type: TowerType | null) => void;
  selectedTowerType: TowerType | null;
  selectedTowerInstance: TowerInstance | null;
  onUpgradeTower: (id: string) => void;
  onSalvageTower: (id: string) => void;
  difficulty?: Difficulty | null;
}

const TowerStore: React.FC<TowerStoreProps> = ({ 
  credits, 
  onSelectTower, 
  selectedTowerType, 
  selectedTowerInstance,
  onUpgradeTower,
  onSalvageTower,
  difficulty = Difficulty.NORMAL
}) => {
  const isUpgrading = !!selectedTowerInstance;
  const costMult = 1.0; // In a real scenario, this would come from DIFFICULTY_CONFIG[difficulty].costMult

  return (
    <div className={`flex flex-col bg-black/80 border-t md:border-t-0 md:border-r backdrop-blur-md h-auto md:h-full w-full md:w-64 relative z-40 transition-all duration-300 ${selectedTowerInstance?.corruption ? 'border-[#bc13fe]/50 shadow-[0_0_15px_rgba(188,19,254,0.1)]' : 'border-green-500/30'}`}>
      <div className={`p-3 md:p-4 border-b flex justify-between items-center shrink-0 ${selectedTowerInstance?.corruption ? 'border-[#bc13fe]/30 bg-[#bc13fe]/5' : 'border-green-500/30 bg-green-500/5'}`}>
        <h2 className={`text-xs md:text-sm font-black uppercase tracking-widest ${selectedTowerInstance?.corruption ? 'text-[#bc13fe]' : 'text-green-400'}`}>
          {isUpgrading ? 'Kernel Inspector' : 'System Arsenal'}
        </h2>
        {!isUpgrading && (
          <div className="md:hidden text-[10px] font-bold text-green-400 tabular-nums">
            ${credits.toLocaleString()}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-x-auto md:overflow-y-auto no-scrollbar p-3 md:p-4 scroll-smooth">
        {isUpgrading ? (
          <div className="flex md:flex-col gap-4 md:gap-5 min-w-max md:min-w-0 pb-2 md:pb-0">
            {/* Tower Identification */}
            <div className={`p-3 md:p-4 border min-w-[200px] md:min-w-0 ${selectedTowerInstance.corruption > 15 ? 'border-[#bc13fe]/40 bg-[#bc13fe]/5' : 'border-green-500/30 bg-green-500/5'}`}>
              <div className="text-[9px] text-white/40 uppercase mb-1 font-bold">Revision Level</div>
              <div className="flex gap-1 mb-3">
                {[...Array(MAX_TOWER_LEVEL)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-4 h-1.5 ${i < selectedTowerInstance.level 
                      ? (selectedTowerInstance.corruption > 30 ? 'bg-[#bc13fe]' : 'bg-green-400') 
                      : 'bg-white/10'}`} 
                  />
                ))}
              </div>
              <div className="text-sm md:text-lg font-black text-white uppercase italic tracking-tighter">
                {TOWERS[selectedTowerInstance.type].name}
              </div>
              
              {/* Corruption Metrics (DLC Only) */}
              {selectedTowerInstance.corruption > 0 && (
                <div className="mt-4 pt-3 border-t border-[#bc13fe]/20">
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-[8px] text-[#bc13fe] font-black uppercase tracking-widest">Behavioral Drift</div>
                    <div className="text-[8px] text-[#bc13fe] font-bold">{Math.floor(selectedTowerInstance.corruption)}%</div>
                  </div>
                  <div className="w-full h-1 bg-[#bc13fe]/10 overflow-hidden border border-[#bc13fe]/30">
                    <div className="h-full bg-[#bc13fe] shadow-[0_0_5px_#bc13fe]" style={{ width: `${selectedTowerInstance.corruption}%` }} />
                  </div>
                  <p className="text-[7px] text-[#bc13fe]/60 mt-1 uppercase italic leading-none">
                    {selectedTowerInstance.corruption > 40 ? "CRITICAL INSTABILITY: CHANCE TO HEAL TARGET" : "MINOR DATA DESYNC DETECTED"}
                  </p>
                </div>
              )}
            </div>

            {/* Scaled Metrics */}
            <div className="space-y-2 min-w-[140px] md:min-w-0">
              <div className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Active Metrics</div>
              <div className="space-y-1 text-[10px] md:text-xs font-mono">
                {(() => {
                  const def = TOWERS[selectedTowerInstance.type];
                  const scale = Math.pow(1.4, selectedTowerInstance.level - 1);
                  return (
                    <>
                      <div className="flex justify-between p-1.5 bg-black/40 border border-white/5">
                        <span className="text-white/40">PWR:</span>
                        <span className="text-white font-bold">{(def.damage * scale).toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between p-1.5 bg-black/40 border border-white/5">
                        <span className="text-white/40">RNG:</span>
                        <span className="text-white font-bold">{(def.range * (1 + (selectedTowerInstance.level-1)*0.15)).toFixed(0)}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Interaction Layer */}
            <div className="flex flex-row md:flex-col gap-2 pt-1 md:pt-2">
              {selectedTowerInstance.level < MAX_TOWER_LEVEL ? (
                (() => {
                  const baseCost = TOWERS[selectedTowerInstance.type].cost;
                  const upgradeCost = Math.floor(baseCost * (selectedTowerInstance.level + 1));
                  const canAfford = credits >= upgradeCost;
                  
                  return (
                    <button
                      onClick={() => onUpgradeTower(selectedTowerInstance.id)}
                      disabled={!canAfford}
                      className={`flex-1 px-4 py-3 border-2 font-black uppercase italic text-[10px] md:text-xs tracking-widest transition-all ${
                        canAfford 
                          ? 'border-green-400 text-green-400 hover:bg-green-400 hover:text-black shadow-[0_0_15px_rgba(57,255,20,0.2)]' 
                          : 'border-red-900/40 text-red-900/60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span>Upgrade</span>
                        <span className="opacity-80">${upgradeCost}</span>
                      </div>
                    </button>
                  );
                })()
              ) : (
                <div className="flex-1 px-4 py-3 border-2 border-white/10 text-white/20 text-center font-black uppercase italic text-[10px] md:text-xs tracking-widest">
                  MAX_REVISION
                </div>
              )}

              <button
                onClick={() => onSalvageTower(selectedTowerInstance.id)}
                className={`px-4 py-2 border font-bold uppercase italic text-[8px] md:text-[10px] tracking-widest transition-all ${
                  selectedTowerInstance.corruption > 15 
                    ? 'border-[#bc13fe] text-[#bc13fe] hover:bg-[#bc13fe] hover:text-black' 
                    : 'border-red-500/30 text-red-500/60 hover:bg-red-500 hover:text-black'
                }`}
              >
                {selectedTowerInstance.corruption > 15 ? 'Purge Data (70%)' : 'Salvage (75%)'}
              </button>
              
              <button 
                onClick={() => onSelectTower(null)}
                className="md:hidden px-4 py-2 border border-white/20 text-white/40 text-[10px] font-bold uppercase"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="flex md:flex-col gap-3 md:gap-4 min-w-max md:min-w-0">
            {(Object.keys(TOWERS) as TowerType[]).map((key) => {
              const t = TOWERS[key];
              const isAffordable = credits >= t.cost;
              const isSelected = selectedTowerType === key;

              return (
                <button
                  key={key}
                  onClick={() => onSelectTower(isSelected ? null : key)}
                  disabled={!isAffordable && !isSelected}
                  className={`flex flex-col justify-center min-w-[140px] md:min-w-0 md:w-full p-2 md:p-3 border text-left transition-all duration-200 group relative overflow-hidden ${
                    isSelected 
                      ? 'bg-green-500/20 border-green-400 scale-[1.02] shadow-[0_0_20px_rgba(57,255,20,0.1)]' 
                      : isAffordable 
                        ? 'border-green-500/20 hover:bg-green-500/5 hover:border-green-500/40' 
                        : 'border-red-900/30 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-black text-[10px] md:text-xs tracking-tighter uppercase truncate">{t.name}</span>
                    <span className={`text-[9px] md:text-xs font-black ${isAffordable ? 'text-green-400' : 'text-red-500'}`}>
                      ${t.cost}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-[8px] md:text-[9px] font-mono opacity-60">
                    <span>PWR: {t.damage}</span>
                    <span>RNG: {t.range}</span>
                  </div>

                  {isSelected && (
                    <div className="absolute top-0 right-0 p-1">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className={`hidden md:block p-4 border-t shrink-0 bg-black/40 ${selectedTowerInstance?.corruption ? 'border-[#bc13fe]/30' : 'border-green-500/30'}`}>
        <div className="text-[9px] text-white/30 uppercase tracking-[0.2em] mb-1 font-black">Available_Credits</div>
        <div className={`text-2xl font-black tabular-nums tracking-tighter ${selectedTowerInstance?.corruption ? 'text-[#bc13fe]' : 'text-green-400'}`}>
          ${credits.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default TowerStore;
