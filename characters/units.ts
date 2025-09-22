import { Character } from './Character';
import type { UnitStats, Affiliation } from '../types';

export class Clubman extends Character {
  constructor(stats: UnitStats, affiliation: Affiliation, x: number) {
    super(stats, affiliation, x);
  }
}

export class Slingshot extends Character {
  constructor(stats: UnitStats, affiliation: Affiliation, x: number) {
    super(stats, affiliation, x);
  }
}

export class Swordsman extends Character {
  constructor(stats: UnitStats, affiliation: Affiliation, x: number) {
    super(stats, affiliation, x);
  }
}

export class Archer extends Character {
  constructor(stats: UnitStats, affiliation: Affiliation, x: number) {
    super(stats, affiliation, x);
  }
}

export class Cyborg extends Character {
  constructor(stats: UnitStats, affiliation: Affiliation, x: number) {
    super(stats, affiliation, x);
  }
}

export class LaserTrooper extends Character {
  constructor(stats: UnitStats, affiliation: Affiliation, x: number) {
    super(stats, affiliation, x);
  }
}

// FIX: Corrected the type for `unitClasses` to be a construct signature for concrete Character subclasses.
// This allows them to be instantiated, resolving the "Cannot create an instance of an abstract class" error.
export const unitClasses: { [key: string]: new (stats: UnitStats, affiliation: Affiliation, x: number) => Character } = {
  "Clubman": Clubman,
  "Slingshot": Slingshot,
  "Swordsman": Swordsman,
  "Archer": Archer,
  "Cyborg": Cyborg,
  "Laser Trooper": LaserTrooper,
};
