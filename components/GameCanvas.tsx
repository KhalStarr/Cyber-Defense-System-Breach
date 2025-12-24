
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point, TowerType, HexCoord, Enemy, TowerInstance, Projectile, EnemyType, GameState, ActiveEvent, EventType, Difficulty } from '../types';
import { HEX_SIZE, THEME, TOWERS, ENEMIES, MAX_TOWER_LEVEL, EVENT_DETAILS, DIFFICULTY_CONFIG } from '../constants';
import { hexToPixel, pixelToHex, coordToString } from '../engine/gridUtils';

interface VisualEffect {
  id: string;
  type: 'explosion' | 'disruption' | 'flash' | 'mutation';
  pos: Point;
  radius: number;
  startTime: number;
  duration: number;
  color: string;
}

interface GameCanvasProps {
  onUpdateState: (credits: number, health: number, wave: number, isGameOver: boolean, isWaveActive: boolean, towers: TowerInstance[], activeEvent?: ActiveEvent | null) => void;
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
  difficulty
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const autoSpawnTimeoutRef = useRef<number | null>(null);
  const spawnIntervalRef = useRef<number | null>(null);
  const lastEventTimeRef = useRef<number>(0);
  const waveStartTimeRef = useRef<number>(0);
  
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
    difficulty
  });
  
  const towersRef = useRef<TowerInstance[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const vfxRef = useRef<VisualEffect[]>([]);
  const pathsRef = useRef<HexCoord[][]>([]);
  const gridCellsRef = useRef<Set<string>>(new Set());
  
  const [hoveredHex, setHoveredHex] = useState<HexCoord | null>(null);

  useEffect(() => {
    stateRef.current.isGodMode = isGodMode;
    if (isGodMode) {
      stateRef.current.health = 100;
      stateRef.current.isGameOver = false;
      stateRef.current.activeEvent = null;
      towersRef.current.forEach(t => t.disruptedUntil = 0);
    }
  }, [isGodMode]);

  useEffect(() => {
    return () => {
      if (autoSpawnTimeoutRef.current) window.clearTimeout(autoSpawnTimeoutRef.current);
      if (spawnIntervalRef.current) window.clearInterval(spawnIntervalRef.current);
    };
  }, []);

  // Grid and Paths Setup
  useEffect(() => {
    const cols = 26;
    const rows = 16;
    gridCellsRef.current.clear();
    for (let q = -cols / 2; q < cols / 2; q++) {
      for (let r = -rows / 2; r < rows / 2; r++) {
        gridCellsRef.current.add(coordToString({ q, r }));
      }
    }

    // Path A (Standard Ingress)
    const p1: HexCoord[] = [];
    for (let q = -12; q < -8; q++) p1.push({ q, r: 0 });
    for (let r = 0; r < 4; r++) p1.push({ q: -8, r });
    for (let q = -8; q < -4; q++) p1.push({ q, r: 4 });
    for (let r = 4; r > -4; r--) p1.push({ q: -4, r });
    for (let q = -4; q < 4; q++) p1.push({ q, r: -4 });
    for (let r = -4; r < 4; r++) p1.push({ q: 4, r });
    for (let q = 4; q < 8; q++) p1.push({ q, r: 4 });
    for (let r = 4; r > 0; r--) p1.push({ q: 8, r });
    for (let q = 8; q < 12; q++) p1.push({ q, r: 0 });

    // Path B (Lateral Flank - structural difficulty) - Enhanced visibility routes
    const p2: HexCoord[] = [];
    for (let q = -12; q < -10; q++) p2.push({ q, r: -5 });
    for (let r = -5; r < -2; r++) p2.push({ q: -10, r });
    for (let q = -10; q < -2; q++) p2.push({ q, r: -2 });
    for (let r = -2; r < 2; r++) p2.push({ q: -2, r });
    for (let q = -2; q < 6; q++) p2.push({ q, r: 2 });
    for (let r = 2; r > -2; r--) p2.push({ q: 6, r });
    for (let q = 6; q < 12; q++) p2.push({ q, r: 0 });
    
    pathsRef.current = [p1, p2];
  }, []);

  const triggerRandomEvent = useCallback((time: number) => {
    if (isGodMode || stateRef.current.isGameOver) return;
    
    if (stateRef.current.activeEvent) {
      if (time - stateRef.current.activeEvent.startTime > stateRef.current.activeEvent.duration) {
        towersRef.current.forEach(t => { t.isInterfered = false; t.isPatched = false; });
        stateRef.current.activeEvent = null;
        lastEventTimeRef.current = time;
      }
      return;
    }

    if (!stateRef.current.isWaveActive) return;

    const timeInWave = time - waveStartTimeRef.current;
    if (timeInWave < 10000) return;

    const dCfg = DIFFICULTY_CONFIG[difficulty];
    const eventCooldown = 20000 / gameSpeed;

    if (time - lastEventTimeRef.current > eventCooldown) {
      const possibleEventTypes = (Object.keys(EVENT_DETAILS) as EventType[]).filter(et => 
        dCfg.eventPool.includes(EVENT_DETAILS[et].category)
      );

      if (possibleEventTypes.length === 0) return;

      const type = possibleEventTypes[Math.floor(Math.random() * possibleEventTypes.length)];
      const details = EVENT_DETAILS[type];

      stateRef.current.activeEvent = {
        type,
        startTime: time,
        duration: details.duration,
        name: details.name,
        description: details.description
      };

      if (type === EventType.TOWER_INTERFERENCE) {
        const shuffled = [...towersRef.current].sort(() => Math.random() - 0.5);
        const count = Math.ceil(shuffled.length * 0.35);
        for (let i = 0; i < count; i++) shuffled[i].isInterfered = true;
      } else if (type === EventType.EMERGENCY_PATCH) {
        const shuffled = [...towersRef.current].sort(() => Math.random() - 0.5);
        const count = Math.ceil(shuffled.length * 0.25);
        for (let i = 0; i < count; i++) shuffled[i].isPatched = true;
      }

      vfxRef.current.push({
        id: `event-${Math.random()}`,
        type: 'flash', pos: { x: 0, y: 0 }, radius: 2000, startTime: time, duration: 500,
        color: details.category === 'good' ? THEME.accent : details.category === 'bad' ? THEME.danger : THEME.warning
      });
    }
  }, [gameSpeed, isGodMode, difficulty]);

  const spawnWave = useCallback(() => {
    if (stateRef.current.isGameOver) return;
    if (autoSpawnTimeoutRef.current) { window.clearTimeout(autoSpawnTimeoutRef.current); autoSpawnTimeoutRef.current = null; }
    if (spawnIntervalRef.current) { window.clearInterval(spawnIntervalRef.current); spawnIntervalRef.current = null; }
    
    stateRef.current.wave += 1;
    stateRef.current.isWaveActive = true;
    waveStartTimeRef.current = performance.now();
    
    const waveNum = stateRef.current.wave;
    const dCfg = DIFFICULTY_CONFIG[difficulty];
    let enemyCount = 8 + Math.floor(waveNum * 1.5);
    let spawned = 0;

    const interval = window.setInterval(() => {
      const isPacketFlood = stateRef.current.activeEvent?.type === EventType.PACKET_FLOOD;
      if (stateRef.current.isGameOver || (spawned >= enemyCount && !isPacketFlood)) {
        window.clearInterval(interval);
        spawnIntervalRef.current = null;
        return;
      }

      const countPerTick = isPacketFlood ? 3 : 1;
      for (let i = 0; i < countPerTick; i++) {
        if (spawned >= enemyCount && !isPacketFlood) break;
        
        const isBossWave = waveNum % 10 === 0;
        let type = EnemyType.BIT_PACKET;
        if (isBossWave && spawned === 0) type = EnemyType.ZERO_DAY;
        else {
          const rand = Math.random();
          if (waveNum > 30 && rand > 0.9) type = EnemyType.ROOTKIT;
          else if (waveNum > 22 && rand > 0.85) type = EnemyType.RANSOMWARE;
          else if (waveNum > 18 && rand > 0.8) type = EnemyType.BOTNET_NODE;
          else if (waveNum > 14 && rand > 0.75) type = EnemyType.LOGIC_BOMB;
          else if (waveNum > 11 && rand > 0.7) type = EnemyType.SPYWARE;
          else if (waveNum > 8 && rand > 0.6) type = EnemyType.TROJAN;
          else if (waveNum > 5 && rand > 0.5) type = EnemyType.WORM;
          else if (waveNum > 2 && rand > 0.3) type = EnemyType.VIRUS;
        }

        const eCfg = ENEMIES[type];
        
        let pathId = 0;
        if (difficulty === Difficulty.NIGHTMARE) {
          pathId = Math.random() > 0.5 ? 1 : 0;
        } else if (difficulty === Difficulty.HARD) {
          const p2Chance = Math.min(0.5, (waveNum - 2) * 0.1); 
          pathId = Math.random() < p2Chance ? 1 : 0;
        }
        
        const activePath = pathsRef.current[pathId];
        const startPixel = hexToPixel(activePath[0].q, activePath[0].r);
        const nextPixel = hexToPixel(activePath[1].q, activePath[1].r);
        
        let hpMult = Math.pow(1.12, waveNum - 1) * dCfg.hpMult;
        if (isPacketFlood) hpMult *= 0.7;

        enemiesRef.current.push({
          id: Math.random().toString(36).substr(2, 9),
          type,
          maxHp: eCfg.hp * hpMult,
          hp: eCfg.hp * hpMult,
          baseSpeed: eCfg.speed * dCfg.speedMult,
          speed: eCfg.speed * dCfg.speedMult,
          speedMult: 1.0,
          slowTimer: 0,
          pathId,
          pathIndex: 0,
          pos: { ...startPixel },
          targetPos: { ...nextPixel },
          progress: 0,
          bounty: eCfg.bounty * dCfg.bountyMult,
          isBoss: type === EnemyType.ZERO_DAY
        });
        spawned++;
      }
    }, 700 / stateRef.current.gameSpeed);

    spawnIntervalRef.current = interval;
  }, [difficulty]);

  useEffect(() => { if (triggerWave) { spawnWave(); onWaveTriggered(); } }, [triggerWave, spawnWave, onWaveTriggered]);

  useEffect(() => {
    stateRef.current.isAutoStart = isAutoStart;
    if (isAutoStart && !stateRef.current.isWaveActive && !autoSpawnTimeoutRef.current && !stateRef.current.isGameOver) {
      const dCfg = DIFFICULTY_CONFIG[difficulty];
      autoSpawnTimeoutRef.current = window.setTimeout(() => {
        if (stateRef.current.isAutoStart && !stateRef.current.isWaveActive && !stateRef.current.isGameOver) spawnWave();
        autoSpawnTimeoutRef.current = null;
      }, dCfg.waveCooldown);
    }
  }, [isAutoStart, spawnWave, difficulty]);

  useEffect(() => {
    if (triggerUpgradeId) {
      const tower = towersRef.current.find(t => t.id === triggerUpgradeId);
      if (tower && tower.level < MAX_TOWER_LEVEL) {
        const cost = TOWERS[tower.type].cost * (tower.level + 1) * DIFFICULTY_CONFIG[difficulty].costMult;
        if (stateRef.current.isGodMode || stateRef.current.credits >= cost) {
          if (!stateRef.current.isGodMode) stateRef.current.credits -= cost;
          tower.level += 1;
        }
      }
      onUpgradeProcessed();
    }
  }, [triggerUpgradeId, onUpgradeProcessed, difficulty]);

  useEffect(() => {
    if (triggerSalvageId) {
      const index = towersRef.current.findIndex(t => t.id === triggerSalvageId);
      if (index !== -1) {
        const t = towersRef.current[index];
        const base = TOWERS[t.type].cost * DIFFICULTY_CONFIG[difficulty].costMult;
        let invested = base;
        if (t.level >= 2) invested += base * 2;
        if (t.level >= 3) invested += base * 3;
        stateRef.current.credits += Math.floor(invested * 0.75);
        towersRef.current.splice(index, 1);
        onTowerSelected(null);
      }
      onSalvageProcessed();
    }
  }, [triggerSalvageId, onSalvageProcessed, onTowerSelected, difficulty]);

  useEffect(() => {
    let animationId: number;
    let lastTime = performance.now();

    const update = (time: number) => {
      const actualDt = (time - lastTime) / 1000;
      const dt = actualDt * gameSpeed;
      lastTime = time;
      stateRef.current.gameSpeed = gameSpeed;

      if (stateRef.current.isGameOver) return;

      triggerRandomEvent(time);
      const activeEv = stateRef.current.activeEvent;
      vfxRef.current = vfxRef.current.filter(fx => time - fx.startTime < fx.duration);

      // 1. Enemy Updates
      for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
        const e = enemiesRef.current[i];
        const dCfg = DIFFICULTY_CONFIG[difficulty];
        let globalSpeedMult = 1.0;
        if (activeEv?.type === EventType.OPTIMIZED_ROUTING) globalSpeedMult = 0.65;
        if (activeEv?.type === EventType.NETWORK_CONGESTION) globalSpeedMult = 1.0 + 0.5 * Math.sin(time / 600);

        if (e.slowTimer > 0) { e.slowTimer -= actualDt * 1000 * gameSpeed; e.speedMult = 0.65; }
        else e.speedMult = 1.0;

        e.speed = e.baseSpeed * e.speedMult * globalSpeedMult;
        const moveStep = e.speed * gameSpeed * 5;
        e.progress += moveStep;
        
        e.pos.x += (e.targetPos.x - e.pos.x) * moveStep;
        e.pos.y += (e.targetPos.y - e.pos.y) * moveStep;

        if (e.progress >= 1) {
          e.pathIndex++;
          const currentPath = pathsRef.current[e.pathId];
          if (e.pathIndex >= currentPath.length - 1) {
            if (!stateRef.current.isGodMode) {
              stateRef.current.health -= e.isBoss ? 50 : 5;
              if (stateRef.current.health <= 0) { stateRef.current.health = 0; stateRef.current.isGameOver = true; }
            }
            enemiesRef.current.splice(i, 1);
          } else {
            const nextHex = currentPath[e.pathIndex + 1];
            e.targetPos = hexToPixel(nextHex.q, nextHex.r);
            e.progress = 0;
          }
        }
      }

      // 2. Tower Logic
      towersRef.current.forEach(tower => {
        if (tower.disruptedUntil > time) return;
        const def = TOWERS[tower.type];
        let scalingFactor = Math.pow(1.4, tower.level - 1);
        let rangeFactor = 1 + (tower.level - 1) * 0.15;
        let speedFactor = 1 + (tower.level - 1) * 0.2;

        if (activeEv?.type === EventType.SIGNAL_JAMMING) rangeFactor *= 0.7;
        if (activeEv?.type === EventType.TOWER_INTERFERENCE && tower.isInterfered) speedFactor *= 0.7;
        if (activeEv?.type === EventType.EMERGENCY_PATCH && tower.isPatched) { speedFactor *= 1.4; rangeFactor *= 1.4; }
        if (activeEv?.type === EventType.CACHE_OVERFLOW) speedFactor *= 1.8;

        tower.rotation += 0.05 * gameSpeed * speedFactor;
        const effectiveFireRate = def.fireRate * speedFactor;
        const cooldown = (1000 / effectiveFireRate);

        if (time - tower.lastFired > cooldown / gameSpeed) {
          let nearest: Enemy | null = null;
          let minDist = def.range * rangeFactor;
          enemiesRef.current.forEach(e => {
            const d = Math.sqrt((e.pos.x - tower.pos.x)**2 + (e.pos.y - tower.pos.y)**2);
            if (d < minDist) { minDist = d; nearest = e; }
          });
          if (nearest) {
            projectilesRef.current.push({
              id: Math.random().toString(), pos: { ...tower.pos }, targetId: nearest.id,
              damage: def.damage * scalingFactor, speed: tower.type === TowerType.DEMOLITION_NODE ? 400 : 650,
              color: def.color, isSlowing: def.isSlowing, sourceType: tower.type, isExplosive: def.isExplosive,
              explosionRadius: tower.type === TowerType.DEMOLITION_NODE ? 80 + (tower.level * 20) : 0
            });
            tower.lastFired = time;
          }
        }
      });

      // 3. Projectile Movement and Collision
      for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
        const p = projectilesRef.current[i];
        const target = enemiesRef.current.find(e => e.id === p.targetId);
        if (!target) { projectilesRef.current.splice(i, 1); continue; }

        const dx = target.pos.x - p.pos.x;
        const dy = target.pos.y - p.pos.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        if (dist < 12) {
          if (p.isExplosive && p.explosionRadius) {
            vfxRef.current.push({ id: `exp-${Math.random()}`, type: 'explosion', pos: { ...p.pos }, radius: p.explosionRadius, startTime: time, duration: 400, color: p.color });
            enemiesRef.current.forEach(e => {
              const edist = Math.sqrt((e.pos.x - p.pos.x)**2 + (e.pos.y - p.pos.y)**2);
              if (edist < p.explosionRadius!) {
                e.hp -= p.damage * (1 - edist / p.explosionRadius!);
                if (e.hp <= 0 && p.sourceType === TowerType.PROXY_SERVER && !e.isFragment) e.killedByProxy = true;
              }
            });
          } else {
            target.hp -= p.damage;
            if (target.hp <= 0 && p.sourceType === TowerType.PROXY_SERVER && !target.isFragment) target.killedByProxy = true;
            if (p.isSlowing) target.slowTimer = 2000;
          }
          projectilesRef.current.splice(i, 1);
        } else {
          p.pos.x += (dx / dist) * p.speed * dt;
          p.pos.y += (dy / dist) * p.speed * dt;
        }
      }

      // 4. Enemy Cleanup and Special Effects
      const newFragments: Enemy[] = [];
      enemiesRef.current = enemiesRef.current.filter(e => {
        if (e.hp <= 0) { 
          stateRef.current.credits += e.bounty; 
          
          // Logic Bomb Mechanic: Disruption + Credit Penalty
          if (e.type === EnemyType.LOGIC_BOMB) {
            const disruptRadius = 150;
            vfxRef.current.push({ id: `dis-${Math.random()}`, type: 'disruption', pos: { ...e.pos }, radius: disruptRadius, startTime: time, duration: 800, color: THEME.danger });
            towersRef.current.forEach(t => {
               const tdist = Math.sqrt((t.pos.x - e.pos.x)**2 + (t.pos.y - e.pos.y)**2);
               if (tdist < disruptRadius) {
                 t.disruptedUntil = time + 2000;
                 // Deduct 10% of tower total worth as "repair damage"
                 const worth = TOWERS[t.type].cost * (1 + (t.level-1)*2);
                 stateRef.current.credits = Math.max(0, stateRef.current.credits - Math.floor(worth * 0.1));
               }
            });
          }

          // Proxy Server Split Mechanic
          if (e.killedByProxy && !e.isFragment) {
            const fragCount = 2 + Math.floor(Math.random() * 2);
            for (let f = 0; f < fragCount; f++) {
              newFragments.push({
                ...e,
                id: `frag-${Math.random().toString(36).substr(2, 9)}`,
                maxHp: e.maxHp * 0.35,
                hp: e.maxHp * 0.35,
                baseSpeed: e.baseSpeed * 1.5,
                speed: e.baseSpeed * 1.5,
                bounty: Math.floor(e.bounty * 0.25),
                isFragment: true,
                killedByProxy: false,
                pos: { x: e.pos.x + (Math.random()-0.5)*10, y: e.pos.y + (Math.random()-0.5)*10 }
              });
            }
          }
          return false; 
        }
        return true;
      });
      if (newFragments.length > 0) enemiesRef.current.push(...newFragments);

      // 5. Wave Completion
      if (stateRef.current.isWaveActive && enemiesRef.current.length === 0 && !spawnIntervalRef.current) {
        stateRef.current.isWaveActive = false;
        if (stateRef.current.activeEvent) stateRef.current.activeEvent = null;
        if (stateRef.current.isAutoStart && !stateRef.current.isGameOver) {
          autoSpawnTimeoutRef.current = window.setTimeout(() => {
            if (stateRef.current.isAutoStart && !stateRef.current.isWaveActive) spawnWave();
            autoSpawnTimeoutRef.current = null;
          }, DIFFICULTY_CONFIG[difficulty].waveCooldown);
        }
      }

      onUpdateState(stateRef.current.credits, stateRef.current.health, stateRef.current.wave, stateRef.current.isGameOver, stateRef.current.isWaveActive, [...towersRef.current], stateRef.current.activeEvent);
      draw(time);
      animationId = requestAnimationFrame(update);
    };

    const draw = (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);

      const dCfg = DIFFICULTY_CONFIG[difficulty];
      const activePaths = (dCfg.dualPath || difficulty === Difficulty.NIGHTMARE) ? pathsRef.current : [pathsRef.current[0]];
      const activeEv = stateRef.current.activeEvent;

      gridCellsRef.current.forEach(id => {
        const [q, r] = id.split(',').map(Number);
        const p = hexToPixel(q, r);
        let isPath = false;
        let pathColor = '#030303';
        let glow = 0;

        for (let i = 0; i < activePaths.length; i++) {
          if (activePaths[i].some(c => c.q === q && c.r === r)) {
            isPath = true;
            // Visible dual paths: Neon Green vs Cyan
            pathColor = i === 0 ? '#0a220a' : '#0a2222';
            glow = i === 0 ? 10 : 8;
            break;
          }
        }
        
        if (isPath) {
          ctx.shadowBlur = glow; ctx.shadowColor = THEME.accent;
          drawHex(ctx, p.x, p.y, HEX_SIZE - 1, pathColor, true);
          ctx.shadowBlur = 0; ctx.strokeStyle = THEME.accent; ctx.lineWidth = 2; ctx.stroke();
        } else {
          drawHex(ctx, p.x, p.y, HEX_SIZE - 1, '#030303', true);
          ctx.strokeStyle = THEME.accent + '11'; ctx.lineWidth = 1; ctx.stroke();
        }
      });

      // Range indicator for selected tower
      if (selectedTowerId) {
        const selectedTower = towersRef.current.find(t => t.id === selectedTowerId);
        if (selectedTower) {
          const def = TOWERS[selectedTower.type];
          let rangeFactor = 1 + (selectedTower.level - 1) * 0.15;
          if (activeEv?.type === EventType.SIGNAL_JAMMING) rangeFactor *= 0.7;
          if (activeEv?.type === EventType.EMERGENCY_PATCH && selectedTower.isPatched) rangeFactor *= 1.4;
          
          const effectiveRange = def.range * rangeFactor;
          const pulse = 0.5 + Math.sin(time / 200) * 0.1;
          
          ctx.save();
          ctx.translate(selectedTower.pos.x, selectedTower.pos.y);
          ctx.beginPath();
          ctx.arc(0, 0, effectiveRange, 0, Math.PI * 2);
          
          // Gradient range circle
          const grad = ctx.createRadialGradient(0, 0, effectiveRange * 0.8, 0, 0, effectiveRange);
          grad.addColorStop(0, 'rgba(57, 255, 20, 0.02)');
          grad.addColorStop(1, `rgba(57, 255, 20, ${0.1 * pulse})`);
          ctx.fillStyle = grad;
          ctx.fill();
          
          // Dashed border
          ctx.setLineDash([10, 5]);
          ctx.strokeStyle = `rgba(57, 255, 20, ${0.3 * pulse})`;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        }
      }

      // Towers
      towersRef.current.forEach(t => {
        const isDisrupted = t.disruptedUntil > time;
        const def = TOWERS[t.type];
        const isSelected = selectedTowerId === t.id;
        
        ctx.save();
        ctx.translate(t.pos.x, t.pos.y);
        ctx.rotate(t.rotation);
        
        if (isDisrupted) {
          ctx.filter = 'sepia(100%) hue-rotate(-50deg) brightness(80%)';
        } else {
          ctx.shadowBlur = isSelected ? 30 : 15;
          ctx.shadowColor = def.color;
        }

        ctx.fillStyle = def.color;
        const scale = 1 + (t.level - 1) * 0.1;
        ctx.scale(scale, scale);

        ctx.beginPath();
        switch(t.type) {
          case TowerType.GATEWAY: ctx.arc(0, 0, 10, 0, Math.PI*2); break;
          case TowerType.FIREWALL: ctx.rect(-12, -12, 24, 24); break;
          case TowerType.SENTINEL: ctx.moveTo(0, -18); ctx.lineTo(15, 12); ctx.lineTo(-15, 12); ctx.closePath(); break;
          case TowerType.PROXY_SERVER: ctx.arc(0, 0, 12, 0, Math.PI*2); ctx.moveTo(6, 0); ctx.arc(0,0,6,0,Math.PI*2); break;
          default: ctx.rect(-10, -10, 20, 20); break;
        }
        ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
        ctx.restore();
      });

      // Enemies (3D Wireframe Style)
      enemiesRef.current.forEach(e => {
        const cfg = ENEMIES[e.type];
        ctx.save();
        ctx.translate(e.pos.x, e.pos.y);
        ctx.rotate(time * 0.005);
        ctx.strokeStyle = cfg.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 12; ctx.shadowColor = cfg.color;
        
        const size = e.isBoss ? 45 : 18;
        
        // Draw primary cube-like wireframe
        ctx.beginPath();
        ctx.rect(-size/2, -size/2, size, size);
        ctx.stroke();
        
        // Inner diamond to simulate depth
        ctx.beginPath();
        ctx.moveTo(0, -size/1.5);
        ctx.lineTo(size/1.5, 0);
        ctx.lineTo(0, size/1.5);
        ctx.lineTo(-size/1.5, 0);
        ctx.closePath();
        ctx.stroke();

        // Connecting vertices for 3D effect
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(-size/2, -size/2); ctx.lineTo(size/2, size/2);
        ctx.moveTo(size/2, -size/2); ctx.lineTo(-size/2, size/2);
        ctx.stroke();
        ctx.restore();
      });

      // Projectiles (Bullet Tracers)
      projectilesRef.current.forEach(p => {
        ctx.shadowBlur = 15; ctx.shadowColor = p.color;
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(p.pos.x, p.pos.y, 3, 0, Math.PI * 2); ctx.fill();
        // Tracer tail
        ctx.strokeStyle = p.color; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(p.pos.x, p.pos.y); ctx.lineTo(p.pos.x - 10, p.pos.y - 10); ctx.stroke();
      });

      // VFX
      vfxRef.current.forEach(fx => {
        const progress = (time - fx.startTime) / fx.duration;
        ctx.save();
        ctx.beginPath();
        ctx.arc(fx.pos.x, fx.pos.y, fx.radius * progress, 0, Math.PI * 2);
        ctx.strokeStyle = fx.color; ctx.lineWidth = 3 * (1 - progress);
        ctx.stroke();
        if (fx.type === 'disruption') { ctx.fillStyle = fx.color; ctx.globalAlpha = 0.1 * (1-progress); ctx.fill(); }
        ctx.restore();
      });

      ctx.restore();
    };

    function drawHex(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, fill: boolean) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) { const angle = (Math.PI / 3) * i + Math.PI / 6; const px = x + radius * Math.cos(angle); const py = y + radius * Math.sin(angle); if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
      ctx.closePath();
      if (fill) { ctx.fillStyle = color; ctx.fill(); } else { ctx.strokeStyle = color; ctx.stroke(); }
    }

    animationId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationId);
  }, [onUpdateState, spawnWave, gameSpeed, difficulty, isGodMode, selectedTowerId, selectedTowerType, triggerRandomEvent]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const rect = canvas.getBoundingClientRect(); const x = e.clientX - rect.left - canvas.width / 2; const y = e.clientY - rect.top - canvas.height / 2;
    setHoveredHex(pixelToHex(x, y));
  };

  const handleClick = () => {
    if (!hoveredHex) return;
    const dCfg = DIFFICULTY_CONFIG[difficulty];
    const activePaths = (dCfg.dualPath || difficulty === Difficulty.NIGHTMARE) ? pathsRef.current : [pathsRef.current[0]];
    const isPath = activePaths.some(path => path.some(c => c.q === hoveredHex.q && c.r === hoveredHex.r));
    const existingTower = towersRef.current.find(t => t.coord.q === hoveredHex.q && t.coord.r === hoveredHex.r);
    
    if (existingTower) { onTowerSelected(existingTower.id); return; }
    
    if (selectedTowerType && !isPath) {
      const def = TOWERS[selectedTowerType];
      const cost = def.cost * DIFFICULTY_CONFIG[difficulty].costMult;
      if (stateRef.current.isGodMode || stateRef.current.credits >= cost) {
        if (!stateRef.current.isGodMode) stateRef.current.credits -= cost;
        const newTower = {
          id: Math.random().toString(36).substr(2, 9), type: selectedTowerType, coord: hoveredHex, pos: hexToPixel(hoveredHex.q, hoveredHex.r),
          lastFired: 0, targetId: null, rotation: 0, level: 1, disruptedUntil: 0
        };
        towersRef.current.push(newTower);
        onTowerPlaced(); onTowerSelected(newTower.id);
      }
    } else { onTowerSelected(null); }
  };

  return (
    <div className="relative w-full h-full bg-[#020202] overflow-hidden cursor-crosshair">
      <canvas ref={canvasRef} width={window.innerWidth - 256} height={window.innerHeight} onMouseMove={handleMouseMove} onClick={handleClick} className="block" />
    </div>
  );
};

export default GameCanvas;
