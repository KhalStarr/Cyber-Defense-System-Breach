
import { TowerType, TowerDef, EnemyType, EventType, Difficulty } from './types';

export const HEX_SIZE = 40;
export const HEX_WIDTH = HEX_SIZE * Math.sqrt(3);
export const HEX_HEIGHT = HEX_SIZE * 2;
export const MAX_TOWER_LEVEL = 3;

export const THEME = {
  bg: '#050505',
  grid: '#0a1a0a',
  path: '#0d2b0d',
  accent: '#39FF14',
  accentDark: '#1a800a',
  danger: '#ff2e2e',
  warning: '#f0ff42'
};

export const DIFFICULTY_CONFIG = {
  [Difficulty.EASY]: {
    name: "Training Protocol",
    description: "System diagnostics and safe-environment testing.",
    bountyMult: 1.25,
    costMult: 0.8,
    eventPool: ['good', 'neutral'] as ('good' | 'bad' | 'neutral')[],
    waveCooldown: 8000,
    dualPath: false,
    hpMult: 0.8,
    speedMult: 0.8
  },
  [Difficulty.NORMAL]: {
    name: "Standard Defense",
    description: "Operating within baseline security parameters.",
    bountyMult: 1.0,
    costMult: 1.0,
    eventPool: ['good', 'bad', 'neutral'] as ('good' | 'bad' | 'neutral')[],
    waveCooldown: 4000,
    dualPath: false,
    hpMult: 1.0,
    speedMult: 1.0
  },
  [Difficulty.HARD]: {
    name: "Multi-Vector Assault",
    description: "Simultaneous breaches detected across parallel nodes.",
    bountyMult: 0.9,
    costMult: 1.1,
    eventPool: ['bad', 'neutral'] as ('good' | 'bad' | 'neutral')[],
    waveCooldown: 2500,
    dualPath: true, // Activated Wave 10
    hpMult: 1.15,
    speedMult: 1.1
  },
  [Difficulty.NIGHTMARE]: {
    name: "System Instability",
    description: "Complete core collapse imminent. Logic gates fluctuating.",
    bountyMult: 0.75,
    costMult: 1.4,
    eventPool: ['bad', 'neutral'] as ('good' | 'bad' | 'neutral')[],
    waveCooldown: 1000,
    dualPath: true, // From Wave 1
    hpMult: 1.5,
    speedMult: 1.3
  }
};

export const EVENT_DETAILS: Record<EventType, { name: string, description: string, duration: number, category: 'bad' | 'good' | 'neutral' }> = {
  [EventType.SIGNAL_JAMMING]: {
    name: "SIGNAL JAMMING",
    description: "Tower targeting range reduced by 30%.",
    duration: 8000,
    category: 'bad'
  },
  [EventType.MEMORY_LEAK]: {
    name: "MEMORY LEAK",
    description: "Towers gain progressive firing delay.",
    duration: 10000,
    category: 'bad'
  },
  [EventType.PACKET_FLOOD]: {
    name: "PACKET FLOOD",
    description: "Heavy incoming traffic detected. Spawning intensified.",
    duration: 12000,
    category: 'bad'
  },
  [EventType.TOWER_INTERFERENCE]: {
    name: "TOWER INTERFERENCE",
    description: "A subset of towers are firing 30% slower.",
    duration: 7000,
    category: 'bad'
  },
  [EventType.EMERGENCY_PATCH]: {
    name: "EMERGENCY PATCH",
    description: "System buffing random kernels. Caution: CPU usage spiked.",
    duration: 7000,
    category: 'good'
  },
  [EventType.OPTIMIZED_ROUTING]: {
    name: "OPTIMIZED ROUTING",
    description: "Malware movement stabilized and slowed.",
    duration: 9000,
    category: 'good'
  },
  [EventType.CACHE_OVERFLOW]: {
    name: "CACHE OVERFLOW",
    description: "Kernels ignoring cooldown protocols.",
    duration: 6000,
    category: 'good'
  },
  [EventType.NETWORK_CONGESTION]: {
    name: "NETWORK CONGESTION",
    description: "Global throughput fluctuating. Timing is critical.",
    duration: 10000,
    category: 'neutral'
  },
  [EventType.MALWARE_MUTATION]: {
    name: "MALWARE MUTATION",
    description: "Threats evolving new defense traits.",
    duration: 15000,
    category: 'neutral'
  },
  [EventType.FEEDBACK_LOOP]: {
    name: "FEEDBACK LOOP",
    description: "Explosive yields doubled. Warning: Volatile debris.",
    duration: 7000,
    category: 'neutral'
  }
};

export const TOWERS: Record<TowerType, TowerDef> = {
  [TowerType.GATEWAY]: {
    type: TowerType.GATEWAY,
    name: 'Gateway V1',
    description: 'Early swarm cleaner. High fire rate, low integrity impact.',
    cost: 40,
    damage: 6,
    range: 150,
    fireRate: 5.0,
    color: '#39FF14'
  },
  [TowerType.FIREWALL]: {
    type: TowerType.FIREWALL,
    name: 'Firewall V2',
    description: 'Choke-point burst. High damage per shot.',
    cost: 100,
    damage: 75,
    range: 160,
    fireRate: 1.2,
    color: '#39FF14'
  },
  [TowerType.SENTINEL]: {
    type: TowerType.SENTINEL,
    name: 'Sentinel X',
    description: 'Priority killer. Range + precision.',
    cost: 200,
    damage: 180,
    range: 420,
    fireRate: 0.5,
    color: '#00f7ff'
  },
  [TowerType.SANDBOX]: {
    type: TowerType.SANDBOX,
    name: 'Sandbox',
    description: 'Time control. Buys time so other kernels can work.',
    cost: 250,
    damage: 2,
    range: 180,
    fireRate: 2.0,
    color: '#f0ff42',
    isSlowing: true
  },
  [TowerType.VPN_NODE]: {
    type: TowerType.VPN_NODE,
    name: 'VPN Node',
    description: 'Generalist fallback. Flexible and stable.',
    cost: 350,
    damage: 50,
    range: 240,
    fireRate: 2.8,
    color: '#00ffaa'
  },
  [TowerType.DECRYPTOR]: {
    type: TowerType.DECRYPTOR,
    name: 'Decryptor Pro',
    description: 'Anti-tank behemoth. Deletes big problems with massive hits.',
    cost: 500,
    damage: 650,
    range: 220,
    fireRate: 0.4,
    color: '#bc13fe'
  },
  [TowerType.PROXY_SERVER]: {
    type: TowerType.PROXY_SERVER,
    name: 'Proxy Server',
    description: 'Enemy transformer. Manipulates state into fast fragments.',
    cost: 650,
    damage: 35,
    range: 260,
    fireRate: 3.0,
    color: '#ff00ff'
  },
  [TowerType.DEMOLITION_NODE]: {
    type: TowerType.DEMOLITION_NODE,
    name: 'Demolition Node',
    description: 'Sector clearing utility. Fires high-yield explosive payloads.',
    cost: 750,
    damage: 400,
    range: 200,
    fireRate: 0.3,
    color: '#ffaa00',
    isExplosive: true
  },
  [TowerType.ANTIMALWARE]: {
    type: TowerType.ANTIMALWARE,
    name: 'Anti-Malware',
    description: 'Heavy eradicator. Specialized "end this now" button.',
    cost: 900,
    damage: 1500,
    range: 300,
    fireRate: 0.3,
    color: '#ff2e2e'
  },
  [TowerType.ENCRYPTION_ENGINE]: {
    type: TowerType.ENCRYPTION_ENGINE,
    name: 'Encrypt Engine',
    description: 'High-throughput defense. Consistent bit-stripping.',
    cost: 1300,
    damage: 400,
    range: 260,
    fireRate: 3.5,
    color: '#ffffff'
  },
  [TowerType.QUANTUM_CORE]: {
    type: TowerType.QUANTUM_CORE,
    name: 'Quantum Core',
    description: 'Late-game anchor. Control + dominance.',
    cost: 2200,
    damage: 4000,
    range: 450,
    fireRate: 0.5,
    color: '#39FF14'
  }
};

export const ENEMIES = {
  [EnemyType.BIT_PACKET]: {
    hp: 20,
    speed: 0.02,
    bounty: 8,
    color: '#39FF14',
    description: 'Basic data fragments. Low integrity.'
  },
  [EnemyType.VIRUS]: {
    hp: 60,
    speed: 0.012,
    bounty: 18,
    color: '#39FF14',
    description: 'Standard self-replicating code.'
  },
  [EnemyType.WORM]: {
    hp: 45,
    speed: 0.024,
    bounty: 25,
    color: '#f0ff42',
    description: 'High-velocity malware.'
  },
  [EnemyType.TROJAN]: {
    hp: 350,
    speed: 0.008,
    bounty: 85,
    color: '#ff2e2e',
    description: 'High-density armored payload.'
  },
  [EnemyType.SPYWARE]: {
    hp: 120,
    speed: 0.02,
    bounty: 45,
    color: '#00f7ff',
    description: 'Agile tracking units.'
  },
  [EnemyType.RANSOMWARE]: {
    hp: 1100,
    speed: 0.006,
    bounty: 220,
    color: '#ff00ff',
    description: 'Encrypted block units.'
  },
  [EnemyType.ROOTKIT]: {
    hp: 2800,
    speed: 0.005,
    bounty: 500,
    color: '#bc13fe',
    description: 'Deep-level infector.'
  },
  [EnemyType.LOGIC_BOMB]: {
    hp: 650,
    speed: 0.018,
    bounty: 150,
    color: '#ffaa00',
    description: 'Volatile logic gate. On death, disables nearby kernels.'
  },
  [EnemyType.BOTNET_NODE]: {
    hp: 200,
    speed: 0.012,
    bounty: 65,
    color: '#00ffaa',
    description: 'Swarm coordinator.'
  },
  [EnemyType.ZERO_DAY]: {
    hp: 7000,
    speed: 0.004,
    bounty: 2500,
    color: '#ffffff',
    description: 'APEX THREAT. An unpatchable vulnerability.'
  }
};
