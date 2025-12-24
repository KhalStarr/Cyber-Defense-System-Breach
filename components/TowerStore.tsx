
import React from 'react';
import { TOWERS, MAX_TOWER_LEVEL } from '../constants';
import { TowerType, TowerInstance } from '../types';

interface TowerStoreProps {
  credits: number;
  onSelectTower: (type: TowerType | null) => void;
  selectedTowerType: TowerType | null;
  selectedTowerInstance: TowerInstance | null;
  onUpgradeTower: (id: string) => void;
  onSalvageTower: (id: string) => void;
}

const TowerStore: React.FC<TowerStoreProps> = ({ 
  credits, 
  onSelectTower, 
  selectedTowerType, 
  selectedTowerInstance,
  onUpgradeTower,
  onSalvageTower
}) => {
  const isUpgrading = !!selectedTowerInstance;
  const isCurrentlyDisrupted = selectedTowerInstance && selectedTowerInstance.disruptedUntil > performance.now();

  return (
    <div className="flex flex-col bg-black/80 border-r border-green-500/30 backdrop-blur-md h-full w-64 relative">
      <div className="p-4 border-b border-green-500/30">
        <h2 className="text-xl font-bold text-green-400">
          {isUpgrading ? 'Kernel Inspector' : 'Defense Arsenal'}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isUpgrading ? (
          <div className="space-y-6">
            {isCurrentlyDisrupted && (
              <div className="p-2 border border-red-500 bg-red-500/10 text-red-500 text-[10px] font-black uppercase text-center animate-pulse">
                KERNEL_DISRUPTED: AWAITING RECOVERY
              </div>
            )}
            
            <div className="p-4 border border-green-500/40 bg-green-500/5">
              <div className="text-xs text-green-600 uppercase mb-1">Active Core</div>
              <div className="text-lg font-black text-white uppercase italic tracking-wider">
                {TOWERS[selectedTowerInstance.type].name}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] text-green-800 font-bold uppercase">Revision:</span>
                <div className="flex gap-1">
                  {[...Array(MAX_TOWER_LEVEL)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-3 h-1 ${i < selectedTowerInstance.level ? 'bg-green-400' : 'bg-green-900/40'}`} 
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] text-green-800 uppercase tracking-widest font-bold">Current Metrics</div>
              <div className="text-[11px] space-y-2">
                {(() => {
                  const def = TOWERS[selectedTowerInstance.type];
                  const scalingFactor = Math.pow(1.4, selectedTowerInstance.level - 1);
                  const rangeFactor = 1 + (selectedTowerInstance.level - 1) * 0.15;
                  const speedFactor = 1 + (selectedTowerInstance.level - 1) * 0.2;
                  
                  return (
                    <>
                      <div className="flex justify-between p-2 bg-black/40 border border-green-500/10">
                        <span className="text-green-700">Payload Pwr:</span>
                        <span className="text-green-400">{(def.damage * scalingFactor).toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-black/40 border border-green-500/10">
                        <span className="text-green-700">Audit Range:</span>
                        <span className="text-green-400">{(def.range * rangeFactor).toFixed(0)}px</span>
                      </div>
                      <div className="flex justify-between p-2 bg-black/40 border border-green-500/10">
                        <span className="text-green-700">Clock Rate:</span>
                        <span className="text-green-400">{(def.fireRate * speedFactor).toFixed(1)}/s</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {selectedTowerInstance.level < MAX_TOWER_LEVEL ? (
                (() => {
                  const upgradeCost = TOWERS[selectedTowerInstance.type].cost * (selectedTowerInstance.level + 1);
                  const canAfford = credits >= upgradeCost;
                  
                  return (
                    <button
                      onClick={() => onUpgradeTower(selectedTowerInstance.id)}
                      disabled={!canAfford}
                      className={`w-full py-4 border-2 font-black uppercase italic text-sm tracking-widest transition-all ${
                        canAfford 
                          ? 'border-green-400 text-green-400 hover:bg-green-400 hover:text-black shadow-[0_0_20px_rgba(57,255,20,0.2)]' 
                          : 'border-red-900/50 text-red-900 cursor-not-allowed opacity-50'
                      }`}
                    >
                      Upgrade kernel
                      <div className="text-[10px] mt-1 opacity-80">${upgradeCost} CR</div>
                    </button>
                  );
                })()
              ) : (
                <div className="w-full py-4 border-2 border-white/20 text-white/40 text-center font-black uppercase italic text-sm tracking-widest">
                  Max Revision
                </div>
              )}

              <button
                onClick={() => onSalvageTower(selectedTowerInstance.id)}
                className="w-full py-2 border border-red-500/30 text-red-500/60 font-bold uppercase italic text-[10px] tracking-widest hover:bg-red-500 hover:text-black transition-all group"
              >
                Salvage Kernel
                <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  +{(() => {
                    const base = TOWERS[selectedTowerInstance.type].cost;
                    let invested = base;
                    if (selectedTowerInstance.level >= 2) invested += base * 2;
                    if (selectedTowerInstance.level >= 3) invested += base * 3;
                    return Math.floor(invested * 0.75);
                  })()} CR
                </span>
              </button>
            </div>

            <button 
              onClick={() => onSelectTower(null)}
              className="w-full py-2 text-[10px] text-green-900 uppercase font-bold hover:text-green-400 transition-colors"
            >
              Back to Arsenal
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selected Tower Pre-Deployment Info */}
            {selectedTowerType && (
              <div className="p-3 border-2 border-green-400 bg-green-500/10 animate-pulse-slow shadow-[0_0_15px_rgba(57,255,20,0.1)]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
                  <span className="text-[10px] font-black uppercase text-green-400 tracking-widest italic">Deployment Manifest</span>
                </div>
                <p className="text-[11px] leading-relaxed text-white font-medium italic mb-2">
                  "{TOWERS[selectedTowerType].description}"
                </p>
                <div className="text-[9px] text-green-600 font-mono flex justify-between uppercase">
                  <span>Status:</span>
                  <span>Awaiting placement...</span>
                </div>
              </div>
            )}

            {(Object.keys(TOWERS) as TowerType[]).map((key) => {
              const t = TOWERS[key];
              const isAffordable = credits >= t.cost;
              const isSelected = selectedTowerType === key;

              return (
                <button
                  key={key}
                  onClick={() => onSelectTower(isSelected ? null : key)}
                  disabled={!isAffordable && !isSelected}
                  className={`w-full p-3 border text-left transition-all duration-200 group relative overflow-hidden ${
                    isSelected 
                      ? 'bg-green-500/30 border-green-400 scale-[1.02] shadow-[0_0_20px_rgba(57,255,20,0.2)]' 
                      : isAffordable 
                        ? 'border-green-500/30 hover:bg-green-500/10 hover:border-green-400' 
                        : 'border-red-900/50 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-sm tracking-wider uppercase">{t.name}</span>
                    <span className={`text-xs font-bold ${isAffordable ? 'text-green-400' : 'text-red-500'}`}>
                      ${t.cost}
                    </span>
                  </div>
                  <div className="text-[10px] text-green-600 font-mono space-y-1">
                    <div className="flex justify-between">
                      <span>PWR:</span> <span>{t.damage}{t.isExplosive ? ' (AOE)' : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CLOCK:</span> <span>{t.fireRate}/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SCAN:</span> <span>{t.range}px</span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute top-0 right-0 p-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-green-500/30 shrink-0 bg-black/40">
        <div className="text-xs text-green-800 uppercase tracking-widest mb-1 font-bold">System Credits</div>
        <div className="text-2xl font-bold text-green-400 tabular-nums">
          ${credits.toLocaleString()}
        </div>
      </div>
      
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { border-color: rgba(57, 255, 20, 0.4); }
          50% { border-color: rgba(57, 255, 20, 0.8); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default TowerStore;
