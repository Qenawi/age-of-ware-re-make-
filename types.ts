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
  walkImage: string;
  attackImage: string;
  width: number;
  height: number;
}

export interface Age {
  name: string;
  xpToEvolve: number;
  background: string;
  baseImage: string;
  units: UnitStats[];
  upgrades: Upgrade[];
}

export interface GameState {
  status: GameStatus;
  winner: Affiliation | null;

  playerHealth: number;
  playerGold: number;
  playerXP: number;
  playerAge: number;
  playerUpgrades: string[];
  
  aiHealth: number;
  aiGold: number;
  aiXP: number;
  aiAge: number;
  aiUpgrades: string[];

  units: Character[];
}