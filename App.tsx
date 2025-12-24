
import React, { useState, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import TowerStore from './components/TowerStore';
import HUD from './components/HUD';
import Database from './components/Database';
import SettingsMenu from './components/SettingsMenu';
import ProtocolSelector from './components/ProtocolSelector';
import { TowerType, TowerInstance, ActiveEvent, Difficulty } from './types';

const App: React.FC = () => {
  const [resetKey, setResetKey] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [credits, setCredits] = useState(250);
  const [health, setHealth] = useState(100);
  const [wave, setWave] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWaveActive, setIsWaveActive] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(1);
  const [isAutoStart, setIsAutoStart] = useState(false);
  const [triggerWave, setTriggerWave] = useState(false);
  const [introDismissed, setIntroDismissed] = useState(false);
  const [isDatabaseOpen, setIsDatabaseOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGodMode, setIsGodMode] = useState(false);
  const [activeEvent, setActiveEvent] = useState<ActiveEvent | null>(null);
  
  const [selectedTowerType, setSelectedTowerType] = useState<TowerType | null>(null);
  const [selectedTowerId, setSelectedTowerId] = useState<string | null>(null);
  const [triggerUpgradeId, setTriggerUpgradeId] = useState<string | null>(null);
  const [triggerSalvageId, setTriggerSalvageId] = useState<string | null>(null);

  const [allTowers, setAllTowers] = useState<TowerInstance[]>([]);

  const handleUpdateState = useCallback((
    newCredits: number, 
    newHealth: number, 
    newWave: number, 
    gameOver: boolean,
    waveActive: boolean,
    towers: TowerInstance[],
    currentEvent?: ActiveEvent | null
  ) => {
    setCredits(newCredits);
    setHealth(newHealth);
    setWave(newWave);
    setIsGameOver(gameOver);
    setIsWaveActive(waveActive);
    setAllTowers(towers);
    if (currentEvent !== undefined) setActiveEvent(currentEvent || null);
  }, []);

  const handleTowerPlaced = () => {
    setSelectedTowerType(null);
  };

  const handleStartWave = () => {
    setTriggerWave(true);
  };

  const handleDismissIntro = () => {
    setIntroDismissed(true);
  };

  const handleSelectTowerId = (id: string | null) => {
    setSelectedTowerId(id);
    if (id) {
      setSelectedTowerType(null);
    }
  };

  const handleUpgradeTower = (id: string) => {
    setTriggerUpgradeId(id);
  };

  const handleSalvageTower = (id: string) => {
    setTriggerSalvageId(id);
  };

  const handleReset = () => {
    setCredits(250);
    setHealth(100);
    setWave(0);
    setIsGameOver(false);
    setIsWaveActive(false);
    setGameSpeed(1);
    setIsAutoStart(false);
    setTriggerWave(false);
    setSelectedTowerType(null);
    setSelectedTowerId(null);
    setTriggerUpgradeId(null);
    setTriggerSalvageId(null);
    setAllTowers([]);
    setIsGodMode(false);
    setIntroDismissed(false);
    setActiveEvent(null);
    setDifficulty(null);
    setResetKey(prev => prev + 1);
  };

  const selectedTowerInstance = allTowers.find(t => t.id === selectedTowerId) || null;

  if (introDismissed && !difficulty) {
    return <ProtocolSelector onSelect={(d) => setDifficulty(d)} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-green-400 font-mono relative">
      <TowerStore 
        credits={isGodMode ? 999999 : credits} 
        selectedTowerType={selectedTowerType} 
        onSelectTower={(type) => {
          setSelectedTowerType(type);
          if (type || type === null) setSelectedTowerId(null);
        }}
        selectedTowerInstance={selectedTowerInstance}
        onUpgradeTower={handleUpgradeTower}
        onSalvageTower={handleSalvageTower}
      />

      <div className="flex-1 relative bg-[#020202]">
        {difficulty && (
          <GameCanvas 
            key={`${resetKey}-${difficulty}`}
            onUpdateState={handleUpdateState} 
            selectedTowerType={selectedTowerType}
            onTowerPlaced={handleTowerPlaced}
            gameSpeed={gameSpeed}
            isAutoStart={isAutoStart}
            triggerWave={triggerWave}
            onWaveTriggered={() => setTriggerWave(false)}
            selectedTowerId={selectedTowerId}
            onTowerSelected={handleSelectTowerId}
            triggerUpgradeId={triggerUpgradeId}
            onUpgradeProcessed={() => setTriggerUpgradeId(null)}
            triggerSalvageId={triggerSalvageId}
            onSalvageProcessed={() => setTriggerSalvageId(null)}
            isGodMode={isGodMode}
            difficulty={difficulty}
          />
        )}
        
        <HUD 
          health={health} 
          wave={wave} 
          isWaveActive={isWaveActive} 
          isGameOver={isGameOver}
          gameSpeed={gameSpeed}
          isAutoStart={isAutoStart}
          onSetSpeed={setGameSpeed}
          onToggleAuto={() => setIsAutoStart(!isAutoStart)}
          onStartWave={handleStartWave}
          onReset={handleReset}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isGodMode={isGodMode}
          activeEvent={activeEvent}
        />

        {isSettingsOpen && (
          <SettingsMenu 
            onClose={() => setIsSettingsOpen(false)}
            onOpenDatabase={() => setIsDatabaseOpen(true)}
            onResetProgress={handleReset}
            onToggleGodMode={() => setIsGodMode(!isGodMode)}
            isGodMode={isGodMode}
          />
        )}

        {isDatabaseOpen && <Database onClose={() => setIsDatabaseOpen(false)} />}

        <div className="absolute inset-0 pointer-events-none border-[20px] border-green-500/5 opacity-20" />
        
        {!introDismissed && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[100]">
            <div className="max-w-md p-10 bg-black/95 border border-green-500/40 text-center space-y-6 backdrop-blur-3xl shadow-[0_0_100px_rgba(57,255,20,0.15)]">
              <div className="inline-block p-2 border border-green-500/20 mb-4">
                <div className="w-12 h-12 border-2 border-green-400 rotate-45 animate-spin" />
              </div>
              <h1 className="text-5xl font-black text-white italic tracking-tighter">BREACH.EXE</h1>
              <p className="text-sm text-green-500/60 leading-relaxed font-light">
                Secure the winding packet routes. The virus must not reach the Central Data Core. 
              </p>
              <div className="pt-6 border-t border-green-500/10">
                <button 
                  onClick={handleDismissIntro}
                  className="pointer-events-auto px-8 py-3 bg-green-500 text-black font-black uppercase hover:bg-white transition-colors"
                >
                  Enter Setup Phase
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
