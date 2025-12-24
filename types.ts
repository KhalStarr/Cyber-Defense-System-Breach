
export type Point = { x: number; y: number };

export enum Difficulty {
  EASY = 'EASY',
  NORMAL = 'NORMAL',
  HARD = 'HARD',
  NIGHTMARE = 'NIGHTMARE'
}

export enum TowerType {
  GATEWAY = 'GATEWAY',
  FIREWALL = 'FIREWALL',
  SENTINEL = 'SENTINEL',
  SANDBOX = 'SANDBOX',
  VPN_NODE = 'VPN_NODE',
  DECRYPTOR = 'DECRYPTOR',
  PROXY_SERVER = 'PROXY_SERVER',
  ANTIMALWARE = 'ANTIMALWARE',
  ENCRYPTION_ENGINE = 'ENCRYPTION_ENGINE',
  QUANTUM_CORE = 'QUANTUM_CORE',
  DEMOLITION_NODE = 'DEMOLITION_NODE'
}

export enum EnemyType {
  BIT_PACKET = 'BIT_PACKET',
  VIRUS = 'VIRUS',
  WORM = 'WORM',
  TROJAN = 'TROJAN',
  SPYWARE = 'SPYWARE',
  RANSOMWARE = 'RANSOMWARE',
  ROOTKIT = 'ROOTKIT',
  LOGIC_BOMB = 'LOGIC_BOMB',
  BOTNET_NODE = 'BOTNET_NODE',
  ZERO_DAY = 'ZERO_DAY'
}

export enum EventType {
  SIGNAL_JAMMING = 'SIGNAL_JAMMING',
  MEMORY_LEAK = 'MEMORY_LEAK',
  PACKET_FLOOD = 'PACKET_FLOOD',
  TOWER_INTERFERENCE = 'TOWER_INTERFERENCE',
  EMERGENCY_PATCH = 'EMERGENCY_PATCH',
  OPTIMIZED_ROUTING = 'OPTIMIZED_ROUTING',
  CACHE_OVERFLOW = 'CACHE_OVERFLOW',
  NETWORK_CONGESTION = 'NETWORK_CONGESTION',
  MALWARE_MUTATION = 'MALWARE_MUTATION',
  FEEDBACK_LOOP = 'FEEDBACK_LOOP'
}

export interface HexCoord {
  q: number;
  r: number;
}

export interface TowerDef {
  type: TowerType;
  name: string;
  description: string;
  cost: number;
  damage: number;
  range: number;
  fireRate: number;
  color: string;
  isSlowing?: boolean;
  isExplosive?: boolean;
}

export interface Enemy {
  id: string;
  type: EnemyType;
  maxHp: number;
  hp: number;
  baseSpeed: number;
  speed: number; 
  speedMult: number; 
  slowTimer: number; 
  pathId: number;
  pathIndex: number; 
  pos: Point;
  targetPos: Point;
  progress: number; 
  bounty: number;
  isBoss?: boolean;
  isFragment?: boolean;
  killedByProxy?: boolean;
  slowImmune?: boolean;
  aoeResist?: boolean;
}

export interface TowerInstance {
  id: string;
  type: TowerType;
  coord: HexCoord;
  pos: Point;
  lastFired: number;
  targetId: string | null;
  rotation: number;
  level: number;
  disruptedUntil: number;
  isInterfered?: boolean;
  isPatched?: boolean;
}

export interface Projectile {
  id: string;
  pos: Point;
  targetId: string;
  damage: number;
  speed: number;
  color: string;
  isSlowing?: boolean;
  sourceType: TowerType;
  isExplosive?: boolean;
  explosionRadius?: number;
}

export interface ActiveEvent {
  type: EventType;
  startTime: number;
  duration: number;
  name: string;
  description: string;
}

export interface GameState {
  credits: number;
  health: number;
  wave: number;
  isGameOver: boolean;
  isWaveActive: boolean;
  gameSpeed: number;
  isAutoStart: boolean;
  isGodMode: boolean;
  activeEvent?: ActiveEvent | null;
  difficulty: Difficulty;
}
