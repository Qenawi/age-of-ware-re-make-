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
  status: 'walking' | 'attacking' | 'idle' | 'dead' = 'walking';
  animationId?: string; // ID for new animation system (e.g., 'cave_melee')

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

    // Prioritize enemy units if in range
    if (closestTarget && minDistance <= this.stats.range) {
        return { target: closestTarget, distance: minDistance, targetIsBase: false };
    }

    // For base attacks, add extra range for melee units (base is a large target)
    const baseAttackRange = this.stats.range < 50 ? 60 : this.stats.range; // Melee gets 60px range for base

    return { target: closestTarget, distance: distanceToBase, targetIsBase: true };
  }

  
  update(deltaTime: number, allUnits: Character[], onDamagePlayerBase: (damage: number) => void, onDamageAIBase: (damage: number) => void): void {
    if (this.isDead()) {
      this.status = 'dead';
      return;
    }

    this.attackCooldown = Math.max(0, this.attackCooldown - deltaTime * 1000);

    const isPlayer = this.affiliation === AffiliationEnum.Player;
    const enemyBaseX = isPlayer ? GAME_CONFIG.AI_BASE_X : GAME_CONFIG.PLAYER_BASE_X;

    // Define movement boundaries - units can get close enough to attack base
    // Allow units to approach within their attack range + small buffer
    const attackBuffer = 10; // Extra pixels to ensure melee can reach
    const minX = GAME_CONFIG.PLAYER_BASE_X + attackBuffer;
    const maxX = GAME_CONFIG.AI_BASE_X - attackBuffer;

    const { target, distance, targetIsBase } = this.findTarget(allUnits, enemyBaseX);
    this.target = target;

    // Determine effective attack range (melee gets extra range for base attacks)
    const effectiveRange = targetIsBase && this.stats.range < 50 ? 60 : this.stats.range;

    if (distance <= effectiveRange) {
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
      // Move forward (no collision blocking)
      this.status = 'walking';
      const direction = isPlayer ? 1 : -1;
      const newX = this.x + (this.stats.speed * deltaTime * direction);

      // Clamp position to boundaries - don't enter bases
      this.x = Math.max(minX, Math.min(maxX, newX));
    }
  }
}
