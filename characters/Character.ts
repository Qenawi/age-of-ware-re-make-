import type { UnitStats, Affiliation } from '../types';
import { Affiliation as AffiliationEnum } from '../types';
import { GAME_CONFIG } from '../constants';

// Base class for all units in the game
export abstract class Character {
  id: string;
  stats: UnitStats;
  affiliation: Affiliation;
  maxHealth: number;
  health: number;
  x: number;
  attackCooldown: number; // in milliseconds
  target: Character | null = null;
  status: 'walking' | 'attacking' = 'walking';

  constructor(stats: UnitStats, affiliation: Affiliation, x: number) {
    this.id = `unit_${Math.random()}_${Date.now()}`;
    this.stats = stats;
    this.affiliation = affiliation;
    this.maxHealth = stats.health;
    this.health = stats.health;
    this.x = x;
    this.attackCooldown = 0;
  }

  isDead(): boolean {
    return this.health <= 0;
  }

  takeDamage(amount: number): void {
    this.health -= amount;
  }

  findTarget(allUnits: Character[], enemyBaseX: number): { target: Character | null, distance: number, targetIsBase: boolean } {
    let closestTarget: Character | null = null;
    let minDistance = Infinity;
    const isPlayer = this.affiliation === AffiliationEnum.Player;

    for (const otherUnit of allUnits) {
      if (this.affiliation !== otherUnit.affiliation) {
        const distance = isPlayer ? otherUnit.x - this.x : this.x - otherUnit.x;
        if (distance > 0 && distance < minDistance) {
          closestTarget = otherUnit;
          minDistance = distance;
        }
      }
    }
    
    const distanceToBase = Math.abs(enemyBaseX - this.x);

    if (closestTarget && minDistance <= this.stats.range) {
        return { target: closestTarget, distance: minDistance, targetIsBase: false };
    }

    return { target: closestTarget, distance: distanceToBase, targetIsBase: true };
  }
  
  update(deltaTime: number, allUnits: Character[], onDamagePlayerBase: (damage: number) => void, onDamageAIBase: (damage: number) => void): void {
    if (this.isDead()) return;

    this.attackCooldown = Math.max(0, this.attackCooldown - deltaTime * 1000);

    const isPlayer = this.affiliation === AffiliationEnum.Player;
    const enemyBaseX = isPlayer ? GAME_CONFIG.AI_BASE_X : GAME_CONFIG.PLAYER_BASE_X;

    const { target, distance, targetIsBase } = this.findTarget(allUnits, enemyBaseX);
    this.target = target;
    
    if (distance <= this.stats.range) {
      this.status = 'attacking';
      if (this.attackCooldown <= 0) {
        this.attackCooldown = 1000 / this.stats.attackSpeed;
        if (target && !targetIsBase) {
            target.takeDamage(this.stats.damage);
        } else {
            if(isPlayer) {
                onDamageAIBase(this.stats.damage);
            } else {
                onDamagePlayerBase(this.stats.damage);
            }
        }
      }
    } else {
      this.status = 'walking';
      const direction = isPlayer ? 1 : -1;
      this.x += this.stats.speed * deltaTime * direction;
    }
  }
}
