
import React, { useState, useCallback, useEffect, useRef } from 'react';
import GameCanvas from './components/GameCanvas';
import TowerStore from './components/TowerStore';
import HUD from './components/HUD';
import Database from './components/Database';
import SettingsMenu from './components/SettingsMenu';
import ProtocolSelector from './components/ProtocolSelector';
import ForkOverlay from './components/ForkOverlay';
import { TowerType, TowerInstance, ActiveEvent, Difficulty, BlacksiteFork } from './types';
import { BLACKSITE_FORKS } from './constants';

const App: React.FC = () => {
  const [resetKey, setResetKey] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [isBlacksite, setIsBlacksite] = useState(false);
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
  const [activeFork, setActiveFork] = useState<BlacksiteFork | null>(null);
  const [resolvedForks, setResolvedForks] = useState<Set<string>>(new Set());
  const [forkChoices, setForkChoices] = useState<Set<string>>(new Set());
  
  const [selectedTowerType, setSelectedTowerType] = useState<TowerType | null>(null);
  const [selectedTowerId, setSelectedTowerId] = useState<string | null>(null);
  const [triggerUpgradeId, setTriggerUpgradeId] = useState<string | null>(null);
  const [triggerSalvageId, setTriggerSalvageId] = useState<string | null>(null);

  const [allTowers, setAllTowers] = useState<TowerInstance[]>([]);
  const [contaminationLevel, setContaminationLevel] = useState(0);

  const autoStartPendingRef = useRef(false);

  // Robust Auto-start logic
  useEffect(() => {
    let timer: number | null = null;
    if (isAutoStart && !isWaveActive && !triggerWave && !isGameOver && !activeFork && introDismissed && difficulty && !autoStartPendingRef.current) {
      autoStartPendingRef.current = true;
      timer = window.setTimeout(() => {
        setTriggerWave(true);
        autoStartPendingRef.current = false;
      }, 1500); 
    }
    return () => {
      if (timer) window.clearTimeout(timer);
      autoStartPendingRef.current = false;
    };
  }, [isAutoStart, isWaveActive, triggerWave, isGameOver, activeFork, introDismissed, difficulty]);

  const handleUpdateState = useCallback((
    newCredits: number, 
    newHealth: number, 
    newWave: number, 
    gameOver: boolean,
    waveActive: boolean,
    towers: TowerInstance[],
    currentEvent?: ActiveEvent | null,
    globalContam?: number
  ) => {
    setCredits(newCredits);
    setHealth(newHealth);
    setWave(newWave);
    setIsGameOver(gameOver);
    setIsWaveActive(waveActive);
    setAllTowers(towers);
    if (globalContam !== undefined) setContaminationLevel(globalContam);
    if (currentEvent !== undefined) setActiveEvent(currentEvent || null);

    if (isBlacksite && newWave > 30 && !gameOver) setIsGameOver(true);

    if (isBlacksite && !gameOver) {
      const fork = BLACKSITE_FORKS[newWave];
      if (fork && !resolvedForks.has(fork.id) && !activeFork && !waveActive) {
        setActiveFork(fork);
      }
    }
  }, [isBlacksite, resolvedForks, activeFork]);

  const handleForkChoice = (choiceId: string) => {
    if (!activeFork) return;
    setResolvedForks(prev => new Set(prev).add(activeFork.id));
    setForkChoices(prev => new Set(prev).add(choiceId));
    setActiveFork(null);
    if (choiceId === 'outbreak') setHealth(h => Math.min(100, h + 20));
  };

  const handleTowerPlaced = () => setSelectedTowerType(null);
  const handleStartWave = () => setTriggerWave(true);
  const handleDismissIntro = () => setIntroDismissed(true);

  const handleSelectTowerId = (id: string | null) => {
    setSelectedTowerId(id);
    if (id) setSelectedTowerType(null);
  };

  const handleUpgradeTower = (id: string) => setTriggerUpgradeId(id);
  const handleSalvageTower = (id: string) => setTriggerSalvageId(id);

  const handleReset = () => {
    setCredits(250); setHealth(100); setWave(0);
    setIsGameOver(false); setIsWaveActive(false); setGameSpeed(1);
    setIsAutoStart(false); setTriggerWave(false);
    setSelectedTowerType(null); setSelectedTowerId(null);
    setTriggerUpgradeId(null); setTriggerSalvageId(null);
    setAllTowers([]); setIsGodMode(false); setIntroDismissed(false);
    setActiveEvent(null); setDifficulty(null); setIsBlacksite(false);
    setActiveFork(null); setResolvedForks(new Set()); setForkChoices(new Set());
    setContaminationLevel(0); setResetKey(prev => prev + 1);
    autoStartPendingRef.current = false;
  };

  const selectedTowerInstance = allTowers.find(t => t.id === selectedTowerId) || null;

  if (introDismissed && !difficulty) {
    return <ProtocolSelector onSelect={(d, blacksite) => { setDifficulty(d); setIsBlacksite(blacksite); }} />;
  }

  return (
    <div className={`flex flex-col-reverse md:flex-row h-screen w-screen overflow-hidden bg-black text-green-400 font-mono relative ${isBlacksite ? 'blacksite-mode' : ''}`}>
      <TowerStore 
        credits={isGodMode ? 999999 : credits} 
        selectedTowerType={selectedTowerType} 
        onSelectTower={(type) => { setSelectedTowerType(type); if (type || type === null) setSelectedTowerId(null); }}
        selectedTowerInstance={selectedTowerInstance}
        onUpgradeTower={handleUpgradeTower}
        onSalvageTower={handleSalvageTower}
        difficulty={difficulty}
      />

      <div className="flex-1 relative bg-[#020202] overflow-hidden">
        {difficulty && (
          <GameCanvas 
            key={`${resetKey}-${difficulty}-${isBlacksite}`}
            onUpdateState={handleUpdateState} 
            selectedTowerType={selectedTowerType}
            onTowerPlaced={handleTowerPlaced}
            gameSpeed={activeFork ? 0 : gameSpeed}
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
            isBlacksiteEnabled={isBlacksite}
            forkChoices={forkChoices}
          />
        )}
        
        <HUD 
          health={health} wave={wave} isWaveActive={isWaveActive} isGameOver={isGameOver}
          gameSpeed={gameSpeed} isAutoStart={isAutoStart} onSetSpeed={setGameSpeed}
          onToggleAuto={() => setIsAutoStart(!isAutoStart)} onStartWave={handleStartWave}
          onReset={handleReset} onOpenSettings={() => setIsSettingsOpen(true)}
          isGodMode={isGodMode} activeEvent={activeEvent} contamination={contaminationLevel}
          isBlacksite={isBlacksite}
        />

        {isGameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-[500] p-6 text-center">
             <h1 className={`text-4xl md:text-6xl font-black mb-4 ${isBlacksite ? 'text-[#bc13fe]' : 'text-red-600'}`}>
                {isBlacksite && wave >= 30 ? 'SYSTEM_COLLAPSE' : 'CORE_BREACHED'}
             </h1>
             <p className="text-white/60 mb-8 max-w-md">
                {isBlacksite ? 'The core threat has consumed the sectors. Shutdown failed.' : 'Malware has reached the central core. System integrity lost.'}
             </p>
             <button onClick={handleReset} className="px-10 py-4 bg-white text-black font-black uppercase tracking-widest">Restart Session</button>
          </div>
        )}

        {activeFork && <ForkOverlay fork={activeFork} onChoice={handleForkChoice} />}
        {isSettingsOpen && <SettingsMenu onClose={() => setIsSettingsOpen(false)} onOpenDatabase={() => setIsDatabaseOpen(true)} onResetProgress={handleReset} onToggleGodMode={() => setIsGodMode(!isGodMode)} isGodMode={isGodMode} />}
        {isDatabaseOpen && <Database onClose={() => setIsDatabaseOpen(false)} globalContamination={contaminationLevel} />}
        
        <div className={`absolute inset-0 pointer-events-none border-[10px] md:border-[20px] opacity-20 ${isBlacksite ? 'border-[#bc13fe]/10' : 'border-green-500/5'}`} />
        {!introDismissed && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[100] p-4">
            <div className="max-w-md w-full p-6 md:p-10 bg-black/95 border border-green-500/40 text-center space-y-4 md:space-y-6 backdrop-blur-3xl shadow-[0_0_100px_rgba(57,255,20,0.15)]">
              <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">BREACH.EXE</h1>
              <p className="text-xs md:text-sm text-green-500/60 leading-relaxed font-light">Secure the packet routes. Malware must not breach the Core.</p>
              <div className="pt-4 md:pt-6 border-t border-green-500/10">
                <button onClick={handleDismissIntro} className="pointer-events-auto w-full md:w-auto px-8 py-3 bg-green-500 text-black font-black uppercase hover:bg-white transition-colors">Enter Setup</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
