
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point, TowerType, HexCoord, Enemy, TowerInstance, Projectile, EnemyType, GameState, ActiveEvent, EventType, Difficulty } from '../types';
import { HEX_SIZE, THEME, TOWERS, ENEMIES, MAX_TOWER_LEVEL, EVENT_DETAILS, DIFFICULTY_CONFIG } from '../constants';
import { hexToPixel, pixelToHex, coordToString, getNeighbors } from '../engine/gridUtils';

interface VisualEffect {
  id: string;
  type: 'explosion' | 'disruption' | 'flash' | 'mutation' | 'glitch' | 'anomaly';
  pos: Point;
  radius: number;
  startTime: number;
  duration: number;
  color: string;
}

interface GameCanvasProps {
  onUpdateState: (credits: number, health: number, wave: number, isGameOver: boolean, isWaveActive: boolean, towers: TowerInstance[], activeEvent?: ActiveEvent | null, globalContam?: number) => void;
  selectedTowerType: TowerType | null;
  onTowerPlaced: () => void;
  gameSpeed: number;
  isAutoStart: boolean;
  triggerWave: boolean;
  onWaveTriggered: () => void;
  selectedTowerId: string | null;
  onTowerSelected: (id: string | null) => void;
  triggerUpgradeId: string | null;
  onUpgradeProcessed: () => void;
  triggerSalvageId: string | null;
  onSalvageProcessed: () => void;
  isGodMode: boolean;
  difficulty: Difficulty;
  isBlacksiteEnabled: boolean;
  forkChoices?: Set<string>;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  onUpdateState, 
  selectedTowerType, 
  onTowerPlaced, 
  gameSpeed, 
  isAutoStart,
  triggerWave,
  onWaveTriggered,
  selectedTowerId,
  onTowerSelected,
  triggerUpgradeId,
  onUpgradeProcessed,
  triggerSalvageId,
  onSalvageProcessed,
  isGodMode,
  difficulty,
  isBlacksiteEnabled,
  forkChoices = new Set()
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spawnIntervalRef = useRef<number | null>(null);
  const lastEventTimeRef = useRef<number>(0);
  const waveStartTimeRef = useRef<number>(0);
  const lastLoopTimeRef = useRef<number>(0);
  
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const stateRef = useRef<GameState>({
    credits: 250,
    health: 100,
    wave: 0,
    isGameOver: false,
    isWaveActive: false,
    gameSpeed: 1,
    isAutoStart: false,
    isGodMode: false,
    activeEvent: null,
    difficulty,
    isBlacksiteEnabled,
    globalContamination: 0,
    contaminationMap: {},
    threatExposed: false,
    threatInteg: 10000
  });
  
  const towersRef = useRef<TowerInstance[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const vfxRef = useRef<VisualEffect[]>([]);
  const pathsRef = useRef<HexCoord[][]>([]);
  const gridCellsRef = useRef<Set<string>>(new Set());

  const lerpColor = (hexA: string, hexB: string, amount: number) => {
    const rA = parseInt(hexA.slice(1, 3), 16);
    const gA = parseInt(hexA.slice(3, 5), 16);
    const bA = parseInt(hexA.slice(5, 7), 16);
    const rB = parseInt(hexB.slice(1, 3), 16);
    const gB = parseInt(hexB.slice(3, 5), 16);
    const bB = parseInt(hexB.slice(5, 7), 16);
    const r = Math.round(rA + (rB - rA) * amount);
    const g = Math.round(gA + (gB - gA) * amount);
    const b = Math.round(bA + (bB - bA) * amount);
    return `rgb(${r}, ${g}, ${b})`;
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const cols = 26; const rows = 16; gridCellsRef.current.clear();
    for (let q = -cols / 2; q < cols / 2; q++) for (let r = -rows / 2; r < rows / 2; r++) gridCellsRef.current.add(coordToString({ q, r }));
    
    const dCfg = DIFFICULTY_CONFIG[difficulty];
    const newPaths: HexCoord[][] = [];

    // Path 1 (Primary Zig-Zag)
    const p1: HexCoord[] = [];
    for (let q = -12; q <= -8; q++) p1.push({ q, r: 0 });
    for (let r = 0; r <= 4; r++) p1.push({ q: -8, r });
    for (let q = -8; q <= -4; q++) p1.push({ q, r: 4 });
    for (let r = 4; r >= -4; r--) p1.push({ q: -4, r });
    for (let q = -4; q <= 4; q++) p1.push({ q, r: -4 });
    for (let r = -4; r <= 4; r++) p1.push({ q: 4, r });
    for (let q = 4; q <= 8; q++) p1.push({ q, r: 4 });
    for (let r = 4; r >= 0; r--) p1.push({ q: 8, r });
    for (let q = 8; q <= 12; q++) p1.push({ q, r: 0 });
    newPaths.push(p1);

    // Path 2 (Mandatory Dual Path for Hard/Nightmare)
    if (dCfg.dualPath) {
      const p2: HexCoord[] = [];
      for (let q = -12; q <= -8; q++) p2.push({ q, r: -2 });
      for (let r = -2; r >= -6; r--) p2.push({ q: -8, r });
      for (let q = -8; q <= -4; q++) p2.push({ q, r: -6 });
      for (let r = -6; r <= 2; r++) p2.push({ q: -4, r });
      for (let q = -4; q <= 4; q++) p2.push({ q, r: 2 });
      for (let r = 2; r >= -6; r--) p2.push({ q: 4, r });
      for (let q = 4; q <= 8; q++) p2.push({ q, r: -6 });
      for (let r = -6; r <= -2; r++) p2.push({ q: 8, r });
      for (let q = 8; q <= 12; q++) p2.push({ q, r: -2 });
      newPaths.push(p2);
    }

    pathsRef.current = newPaths;
  }, [difficulty]);

  const triggerRandomEvent = useCallback((time: number) => {
    if (isGodMode || stateRef.current.isGameOver) return;
    if (stateRef.current.activeEvent) {
      if (time - stateRef.current.activeEvent.startTime > stateRef.current.activeEvent.duration) {
        stateRef.current.activeEvent = null; lastEventTimeRef.current = time;
      }
      return;
    }
    if (!stateRef.current.isWaveActive) return;
    
    const dCfg = DIFFICULTY_CONFIG[difficulty];
    const escalationMult = isBlacksiteEnabled ? (1 - (stateRef.current.globalContamination / 120)) : 1.0;
    let eventCooldown = (20000 * escalationMult) / (gameSpeed || 1);
    if (forkChoices.has('freeze')) eventCooldown *= 1.5;

    if (time - lastEventTimeRef.current > eventCooldown) {
      const pool = isBlacksiteEnabled ? [...dCfg.eventPool, 'blacksite' as const] : dCfg.eventPool;
      const possibleEventTypes = (Object.keys(EVENT_DETAILS) as EventType[]).filter(et => pool.includes(EVENT_DETAILS[et].category));
      if (possibleEventTypes.length === 0) return;
      const type = possibleEventTypes[Math.floor(Math.random() * possibleEventTypes.length)];
      const details = EVENT_DETAILS[type];
      stateRef.current.activeEvent = { type, startTime: time, duration: details.duration, name: details.name, description: details.description };
      
      vfxRef.current.push({ id: `event-${Math.random()}`, type: 'flash', pos: { x: 0, y: 0 }, radius: 2000, startTime: time, duration: 500, color: details.category === 'blacksite' ? THEME.blacksite : details.category === 'good' ? THEME.accent : THEME.danger });
    }
  }, [gameSpeed, isGodMode, difficulty, isBlacksiteEnabled, forkChoices]);

  const spawnWave = useCallback(() => {
    if (stateRef.current.isGameOver) return;
    stateRef.current.wave += 1; 
    stateRef.current.isWaveActive = true; 
    waveStartTimeRef.current = lastLoopTimeRef.current || performance.now();
    const waveNum = stateRef.current.wave; const dCfg = DIFFICULTY_CONFIG[difficulty];
    let enemyCount = 8 + Math.floor(waveNum * 1.5); let spawned = 0;
    
    if (isBlacksiteEnabled && waveNum > 25) enemyCount *= 2;

    const interval = window.setInterval(() => {
      if (stateRef.current.isGameOver || (spawned >= enemyCount)) { window.clearInterval(interval); spawnIntervalRef.current = null; return; }
      let type = EnemyType.BIT_PACKET;
      if (waveNum > 5) type = Math.random() > 0.7 ? EnemyType.VIRUS : type;
      if (waveNum > 12) type = Math.random() > 0.8 ? EnemyType.ROOTKIT : type;
      if (waveNum > 20 && spawned === 0) type = EnemyType.ZERO_DAY;

      const eCfg = ENEMIES[type];
      const pathId = Math.floor(Math.random() * pathsRef.current.length);
      const activePath = pathsRef.current[pathId];
      const startPixel = hexToPixel(activePath[0].q, activePath[0].r);
      
      enemiesRef.current.push({
        id: Math.random().toString(36).substr(2, 9), type, 
        maxHp: eCfg.hp * Math.pow(1.12, waveNum - 1) * dCfg.hpMult, 
        hp: eCfg.hp * Math.pow(1.12, waveNum - 1) * dCfg.hpMult,
        baseSpeed: eCfg.speed * dCfg.speedMult, speed: eCfg.speed * dCfg.speedMult, speedMult: 1.0, slowTimer: 0,
        pathId, pathIndex: 0, pos: { ...startPixel }, 
        targetPos: hexToPixel(activePath[1].q, activePath[1].r), progress: 0, bounty: eCfg.bounty * dCfg.bountyMult
      });
      spawned++;
    }, (700 / (stateRef.current.gameSpeed || 1)));
    spawnIntervalRef.current = interval;

    onUpdateState(stateRef.current.credits, stateRef.current.health, stateRef.current.wave, stateRef.current.isGameOver, stateRef.current.isWaveActive, [...towersRef.current], stateRef.current.activeEvent, stateRef.current.globalContamination);
  }, [difficulty, isBlacksiteEnabled, onUpdateState]);

  useEffect(() => { if (triggerWave) { spawnWave(); onWaveTriggered(); } }, [triggerWave, spawnWave, onWaveTriggered]);

  useEffect(() => {
    if (triggerUpgradeId) {
      if (stateRef.current.activeEvent?.type === EventType.QUARANTINE_LOCKDOWN) return;
      const tower = towersRef.current.find(t => t.id === triggerUpgradeId);
      if (tower && tower.level < MAX_TOWER_LEVEL) {
        const baseCost = TOWERS[tower.type].cost;
        const upgradeCost = Math.floor(baseCost * (tower.level + 1));
        if (stateRef.current.isGodMode || stateRef.current.credits >= upgradeCost) {
          if (!stateRef.current.isGodMode) stateRef.current.credits -= upgradeCost;
          tower.level += 1;
          vfxRef.current.push({ id: `upgrade-${Math.random()}`, type: 'flash', pos: { ...tower.pos }, radius: 80, startTime: lastLoopTimeRef.current || performance.now(), duration: 600, color: THEME.accent });
        }
      }
      onUpgradeProcessed();
    }
  }, [triggerUpgradeId, onUpgradeProcessed]);

  useEffect(() => {
    if (triggerSalvageId) {
      const index = towersRef.current.findIndex(t => t.id === triggerSalvageId);
      if (index !== -1) {
        const t = towersRef.current[index];
        if (isBlacksiteEnabled) {
          const baseSpill = 15;
          const corruptionSpill = Math.floor(t.corruption * 0.85);
          const totalSpill = baseSpill + corruptionSpill;

          const neighbors = getNeighbors(t.coord.q, t.coord.r);
          stateRef.current.contaminationMap[coordToString(t.coord)] = Math.min(100, (stateRef.current.contaminationMap[coordToString(t.coord)] || 0) + totalSpill * 2.0);
          neighbors.forEach(n => {
             const key = coordToString(n);
             stateRef.current.contaminationMap[key] = Math.min(100, (stateRef.current.contaminationMap[key] || 0) + totalSpill * 0.75);
          });
          vfxRef.current.push({ id: `purge-${Math.random()}`, type: 'anomaly', pos: { ...t.pos }, radius: 200 + totalSpill, startTime: lastLoopTimeRef.current || performance.now(), duration: 1800, color: THEME.blacksite });
        }
        const refundFactor = isBlacksiteEnabled ? Math.max(0.1, 0.7 - (t.corruption / 120)) : 0.75;
        stateRef.current.credits += Math.floor(TOWERS[t.type].cost * refundFactor);
        towersRef.current.splice(index, 1);
        onTowerSelected(null);
      }
      onSalvageProcessed();
    }
  }, [triggerSalvageId, onSalvageProcessed, isBlacksiteEnabled, onTowerSelected]);

  useEffect(() => {
    let animationId: number; let lastTime = performance.now();
    const update = (time: number) => {
      lastLoopTimeRef.current = time;
      if (gameSpeed === 0) { lastTime = time; animationId = requestAnimationFrame(update); return; }
      const dt = (time - lastTime) / 1000 * gameSpeed; lastTime = time;
      stateRef.current.gameSpeed = gameSpeed;
      if (stateRef.current.isGameOver) return;
      triggerRandomEvent(time);
      const activeEv = stateRef.current.activeEvent;
      vfxRef.current = vfxRef.current.filter(fx => time - fx.startTime < fx.duration);

      if (isBlacksiteEnabled && Math.random() < 0.12 * gameSpeed) {
        const keys = Object.keys(stateRef.current.contaminationMap).filter(k => stateRef.current.contaminationMap[k] > 10);
        if (keys.length > 0) {
           const k = keys[Math.floor(Math.random() * keys.length)];
           const [q, r] = k.split(',').map(Number);
           const p = hexToPixel(q, r);
           vfxRef.current.push({ id: `anom-${Math.random()}`, type: 'glitch', pos: p, radius: 60, startTime: time, duration: 700, color: THEME.blacksite });
        }
      }

      let currentBountyMult = forkChoices.has('freeze') ? 0.75 : 1.0;
      let corruptionGainMult = forkChoices.has('freeze') ? 0.5 : 1.0;
      if (forkChoices.has('expose')) corruptionGainMult *= 2.0;

      for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
        const e = enemiesRef.current[i];
        let moveStep = e.speed * gameSpeed * 5;
        const activePath = pathsRef.current[e.pathId];
        
        if (isBlacksiteEnabled) {
          const hex = pixelToHex(e.pos.x, e.pos.y);
          const contam = stateRef.current.contaminationMap[coordToString(hex)] || 0;
          if (contam > 25) moveStep *= (1 + (contam / 110)); 
          
          if (e.type === EnemyType.ROOTKIT || e.type === EnemyType.ZERO_DAY) {
            towersRef.current.forEach(t => {
              const d = Math.sqrt((t.pos.x - e.pos.x)**2 + (t.pos.y - e.pos.y)**2);
              if (d < 200) t.corruption = Math.min(100, t.corruption + 0.25 * gameSpeed * corruptionGainMult);
            });
          }
        }

        e.pos.x += (e.targetPos.x - e.pos.x) * moveStep; e.pos.y += (e.targetPos.y - e.pos.y) * moveStep;
        e.progress += moveStep;
        if (e.progress >= 1) {
          e.pathIndex++;
          if (e.pathIndex >= activePath.length - 1) {
            stateRef.current.health -= 5; enemiesRef.current.splice(i, 1);
            if (stateRef.current.health <= 0) stateRef.current.isGameOver = true;
          } else {
            if (activePath[e.pathIndex + 1]) {
              e.targetPos = hexToPixel(activePath[e.pathIndex + 1].q, activePath[e.pathIndex + 1].r); e.progress = 0;
            } else {
              enemiesRef.current.splice(i, 1);
            }
          }
        }
      }

      towersRef.current.forEach(tower => {
        if (tower.disruptedUntil > time) return;
        const def = TOWERS[tower.type];

        if (isBlacksiteEnabled) {
          const hexKey = coordToString(tower.coord);
          const contam = stateRef.current.contaminationMap[hexKey] || 0;
          if (contam > 0) tower.corruption = Math.min(100, tower.corruption + 0.08 * gameSpeed * (contam / 12) * corruptionGainMult);
          if (activeEv?.type === EventType.CONTAINMENT_FAILURE) tower.corruption += 0.15 * gameSpeed * corruptionGainMult;
          
          if (tower.corruption > 90 && Math.random() < 0.002 * gameSpeed) {
             vfxRef.current.push({ id: `betrayal-${Math.random()}`, type: 'anomaly', pos: { ...tower.pos }, radius: 100, startTime: time, duration: 1000, color: THEME.blacksite });
             enemiesRef.current.push({
               id: `frag-${Math.random()}`, type: EnemyType.HOSTILE_FRAGMENT, 
               maxHp: 400, hp: 400, baseSpeed: 0.035, speed: 0.035, speedMult: 1.0, slowTimer: 0,
               pathId: 0, pathIndex: pathsRef.current[0].length - 1, pos: { ...tower.pos },
               targetPos: hexToPixel(pathsRef.current[0][pathsRef.current[0].length - 2].q, pathsRef.current[0][pathsRef.current[0].length - 2].r),
               progress: 0, bounty: 0, isFragment: true
             });
          }
        }

        let speedFactor = 1 + (tower.level - 1) * 0.25;
        if (isBlacksiteEnabled && tower.corruption > 20) {
          speedFactor *= (1 - (tower.corruption - 20) / 120);
          if (Math.random() < 0.02 * gameSpeed) tower.rotation += (Math.random()-0.5) * 0.7;
        }

        const cooldown = (1000 / (def.fireRate * speedFactor));
        if (time - tower.lastFired > cooldown / gameSpeed) {
          let nearest: Enemy | null = null, minDist = def.range * (1 + (tower.level-1)*0.15);
          enemiesRef.current.forEach(e => {
            const d = Math.sqrt((e.pos.x - tower.pos.x)**2 + (e.pos.y - tower.pos.y)**2);
            if (d < minDist) { minDist = d; nearest = e; }
          });

          if (nearest) {
            let isCorrupted = false;
            let isInverted = false;
            if (isBlacksiteEnabled) {
              if (tower.corruption > 35 && Math.random() < (tower.corruption / 140)) isInverted = true;
              if (tower.corruption > 65) isCorrupted = true;
            }
            projectilesRef.current.push({
              id: Math.random().toString(), pos: { ...tower.pos }, targetId: nearest.id, damage: def.damage * Math.pow(1.4, tower.level-1), speed: 700,
              color: isCorrupted || isInverted ? THEME.blacksite : def.color, 
              isSlowing: def.isSlowing, sourceType: tower.type, isCorrupted, isInverted
            });
            tower.lastFired = time;
          }
        }
      });

      for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
        const p = projectilesRef.current[i]; const target = enemiesRef.current.find(e => e.id === p.targetId);
        if (!target) { projectilesRef.current.splice(i, 1); continue; }
        const dx = target.pos.x - p.pos.x, dy = target.pos.y - p.pos.y, dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 12) {
          if (p.isInverted) {
            target.hp = Math.min(target.maxHp, target.hp + p.damage * 0.7);
            vfxRef.current.push({ id: `heal-${Math.random()}`, type: 'glitch', pos: { ...p.pos }, radius: 45, startTime: time, duration: 550, color: THEME.blacksite });
          } else {
            target.hp -= p.damage;
          }
          projectilesRef.current.splice(i, 1);
        } else {
          p.pos.x += (dx / dist) * p.speed * dt; p.pos.y += (dy / dist) * p.speed * dt;
        }
      }

      enemiesRef.current = enemiesRef.current.filter(e => {
        if (e.hp <= 0) {
          stateRef.current.credits += Math.floor(e.bounty * currentBountyMult);
          if (isBlacksiteEnabled && (e.type === EnemyType.ROOTKIT || e.type === EnemyType.ZERO_DAY)) {
             towersRef.current.forEach(t => {
                const d = Math.sqrt((t.pos.x - e.pos.x)**2 + (t.pos.y - e.pos.y)**2);
                if (d < 300) t.corruption = Math.min(100, t.corruption + 15);
             });
          }
          return false;
        }
        return true;
      });

      if (stateRef.current.isWaveActive && enemiesRef.current.length === 0 && !spawnIntervalRef.current) stateRef.current.isWaveActive = false;
      
      if (isBlacksiteEnabled) {
         const totalContam = Object.values(stateRef.current.contaminationMap).reduce((a, b) => a + b, 0);
         stateRef.current.globalContamination = Math.min(100, totalContam / 4.0);
      }

      onUpdateState(stateRef.current.credits, stateRef.current.health, stateRef.current.wave, stateRef.current.isGameOver, stateRef.current.isWaveActive, [...towersRef.current], stateRef.current.activeEvent, stateRef.current.globalContamination);
      draw(time);
      animationId = requestAnimationFrame(update);
    };

    const draw = (time: number) => {
      const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.save(); ctx.translate(canvas.width / 2, canvas.height / 2);

      const baseAccent = THEME.accent;
      const baseMuted = THEME.accent + '33';

      gridCellsRef.current.forEach(id => {
        const [q, r] = id.split(',').map(Number); const p = hexToPixel(q, r);
        const isPath = pathsRef.current.some(path => path.some(c => c.q === q && c.r === r));
        const contam = stateRef.current.contaminationMap[id] || 0;
        
        let strokeColor = isPath ? baseAccent : baseMuted;
        let lineWidth = isPath ? 4 : 1;
        let shadowBlur = isPath ? 20 : 0;
        let shadowColor = baseAccent;

        if (isBlacksiteEnabled && contam > 0) {
          const factor = Math.min(1, contam / 80);
          strokeColor = lerpColor(strokeColor, THEME.blacksite, factor);
          if (contam > 10) {
            shadowBlur = Math.max(shadowBlur, contam / 1.5);
            shadowColor = THEME.blacksite;
          }
        }
        
        ctx.beginPath();
        for (let i = 0; i < 6; i++) { 
          const angle = (Math.PI / 3) * i + Math.PI / 6; 
          const px = p.x + (HEX_SIZE - 1) * Math.cos(angle); 
          const py = p.y + (HEX_SIZE - 1) * Math.sin(angle); 
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); 
        }
        ctx.closePath();
        
        ctx.shadowBlur = shadowBlur; ctx.shadowColor = shadowColor;
        ctx.strokeStyle = strokeColor; ctx.lineWidth = lineWidth;
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      towersRef.current.forEach(t => {
        const def = TOWERS[t.type]; ctx.save(); ctx.translate(t.pos.x, t.pos.y); ctx.rotate(t.rotation);
        if (isBlacksiteEnabled && t.corruption > 25) {
          const intensity = (t.corruption - 25) / 7;
          ctx.translate((Math.random()-0.5)*intensity, (Math.random()-0.5)*intensity);
        }
        const baseColor = def.color;
        ctx.fillStyle = (isBlacksiteEnabled && t.corruption > 0) ? lerpColor(baseColor, THEME.blacksite, t.corruption / 100) : baseColor;
        
        if (selectedTowerId === t.id) { 
          ctx.shadowBlur = 30; ctx.shadowColor = ctx.fillStyle as string; 
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI*2); ctx.stroke(); 
        }

        const scaleFactor = 1 + (t.level - 1) * 0.12; ctx.scale(scaleFactor, scaleFactor);
        ctx.beginPath();
        switch(t.type) {
          case TowerType.GATEWAY: ctx.arc(0, 0, 14, 0, Math.PI * 2); break;
          case TowerType.FIREWALL: ctx.rect(-15, -15, 30, 30); break;
          case TowerType.SENTINEL: ctx.moveTo(0, -22); ctx.lineTo(20, 16); ctx.lineTo(-20, 16); ctx.closePath(); break;
          case TowerType.SANDBOX: ctx.moveTo(0, -20); ctx.lineTo(20, 0); ctx.lineTo(0, 20); ctx.lineTo(-20, 0); ctx.closePath(); break;
          case TowerType.DECRYPTOR: ctx.rect(-22, -7, 44, 14); ctx.rect(-7, -22, 14, 44); break;
          default: ctx.rect(-12, -12, 24, 24); break;
        }
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.restore();
      });

      enemiesRef.current.forEach(e => {
        ctx.save(); ctx.translate(e.pos.x, e.pos.y); ctx.rotate(time * 0.005);
        ctx.strokeStyle = ENEMIES[e.type].color; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.rect(-11, -11, 22, 22); ctx.stroke(); ctx.restore();
      });

      projectilesRef.current.forEach(p => {
        ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.pos.x, p.pos.y, 4.5, 0, Math.PI * 2); ctx.fill();
        if (p.isCorrupted || p.isInverted) { ctx.shadowBlur = 15; ctx.shadowColor = THEME.blacksite; }
      });

      vfxRef.current.forEach(fx => {
        const progress = (time - fx.startTime) / fx.duration;
        const currentRadius = Math.max(0, fx.radius * progress);
        ctx.save(); ctx.beginPath(); 
        ctx.arc(fx.pos.x, fx.pos.y, currentRadius, 0, Math.PI * 2);
        ctx.strokeStyle = fx.color; ctx.lineWidth = Math.max(0, 4 * (1 - progress)); ctx.stroke(); ctx.restore();
      });
      ctx.restore();
    };

    animationId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationId);
  }, [onUpdateState, spawnWave, gameSpeed, difficulty, isGodMode, selectedTowerId, selectedTowerType, triggerRandomEvent, isBlacksiteEnabled, forkChoices, triggerUpgradeId]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (stateRef.current.activeEvent?.type === EventType.QUARANTINE_LOCKDOWN) return;
    const canvas = canvasRef.current; if (!canvas) return; const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - canvas.width / 2, y = e.clientY - rect.top - canvas.height / 2;
    const hex = pixelToHex(x, y);
    const existingTower = towersRef.current.find(t => t.coord.q === hex.q && t.coord.r === hex.r);
    if (existingTower) { onTowerSelected(existingTower.id); return; }
    if (selectedTowerType) {
      const isPath = pathsRef.current.some(path => path.some(c => c.q === hex.q && c.r === hex.r));
      const cost = TOWERS[selectedTowerType].cost * (DIFFICULTY_CONFIG[difficulty]?.costMult || 1);
      if (!isPath && (stateRef.current.isGodMode || stateRef.current.credits >= cost)) {
        if (!stateRef.current.isGodMode) stateRef.current.credits -= cost;
        const initialCorruption = isBlacksiteEnabled ? (stateRef.current.contaminationMap[coordToString(hex)] || 0) : 0;
        towersRef.current.push({ id: Math.random().toString(36).substr(2, 9), type: selectedTowerType, coord: hex, pos: hexToPixel(hex.q, hex.r), lastFired: 0, targetId: null, rotation: 0, level: 1, disruptedUntil: 0, corruption: initialCorruption });
        onTowerPlaced();
      }
    } else onTowerSelected(null);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#020202] overflow-hidden cursor-crosshair">
      <canvas ref={canvasRef} width={dimensions.width} height={dimensions.height} onPointerDown={handlePointerDown} className="block w-full h-full" />
    </div>
  );
};

export default GameCanvas;
