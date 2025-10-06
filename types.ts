import type { Character } from './characters/Character';

export enum GameStatus {
  StartScreen,
  Playing,
  GameOver,
}

export enum Affiliation {
  Player,
  AI,
}

export interface Upgrade {
  name: string;
  description: string;
  cost: number; // XP
  unitName: string;
  stat: keyof Omit<UnitStats, 'icon' | 'walkImage' | 'attackImage' | 'name'>;
  value: number; // The amount to add
}

export interface UnitStats {
  name: string;
  cost: number;
  health: number;
  damage: number;
  range: number; // pixels
  attackSpeed: number; // attacks per second
  speed: number; // pixels per second
  icon: string;
  walkImage: string; // Fallback for old animation system
  attackImage: string; // Fallback for old animation system
  width: number;
  height: number;
  animationId?: string; // ID for new animation system (e.g., 'cave_melee')
}

export interface Age {
  name: string;
  xpToEvolve: number;
  background: string;
  baseImage: string;
  units: UnitStats[];
  upgrades: Upgrade[];
  towers: TowerStats[];
}

export interface BuildQueueItem {
  unitStats: UnitStats;
  affiliation: Affiliation;
  timeRemaining: number; // milliseconds
}

export interface TowerStats {
  name: string;
  cost: number;
  damage: number;
  range: number;
  attackSpeed: number; // attacks per second
  sellValue: number; // 50% of cost
  image: string;
  upgradeFrom?: string; // Name of tower this upgrades from
  lastAttackTime?: number; // timestamp of last attack
}

export interface TowerSlot {
  id: number;
  tower: TowerStats | null;
  x: number; // position on battlefield
  y: number; // position on battlefield
}

export interface GameState {
  status: GameStatus;
  winner: Affiliation | null;

  playerHealth: number;
  playerGold: number;
  playerXP: number;
  playerAge: number;
  playerUpgrades: string[];
  playerBuildQueue: BuildQueueItem[];
  playerTowers: TowerSlot[];

  aiHealth: number;
  aiGold: number;
  aiXP: number;
  aiAge: number;
  aiUpgrades: string[];
  aiBuildQueue: BuildQueueItem[];
  aiTowers: TowerSlot[];

  units: Character[];
}