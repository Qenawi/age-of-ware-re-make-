import type { GameManager } from './GameManager';
import { AGES, GAME_CONFIG } from './constants';
import { Affiliation } from './types';

export enum Difficulty {
  Medium = 'medium',
  Hard = 'hard'
}

export class BotMind {
  private gameManager: GameManager;
  private lastActionTime: number = 0;
  private lastTowerCheckTime: number = 0;
  private difficulty: Difficulty;
  private unitMixCounter: number = 0;
  private aggressionLevel: number = 0.5; // 0 = defensive, 1 = aggressive
  private gameStartTime: number = 0;
  private lastAbilityCheckTime: number = 0;

  constructor(gameManager: GameManager, difficulty: Difficulty = Difficulty.Hard) {
    this.gameManager = gameManager;
    this.difficulty = difficulty;
    this.gameStartTime = performance.now();
  }

  update(now: number): void {
    // Learning curve: AI gets smarter over time
    const gameTimeSeconds = (now - this.gameStartTime) / 1000;
    const learningProgress = Math.min(gameTimeSeconds / 180, 1); // Peaks at 3 minutes

    // Adapt aggression based on game state
    this.updateAggression();

    // Base action rate with learning curve
    let actionRate = GAME_CONFIG.AI_SPAWN_RATE_MS;

    if (this.difficulty === Difficulty.Hard) {
      // Hard mode: Gets faster over time (max 50% faster)
      actionRate *= (1 - learningProgress * 0.5);
    } else {
      // Medium mode: Gradual improvement (max 30% faster)
      actionRate *= (1 - learningProgress * 0.3);
    }

    if (now - this.lastActionTime > actionRate) {
      this.decideAction();
      this.lastActionTime = now;
    }

    // Tower management frequency increases with learning
    const towerCheckRate = 10000 - (learningProgress * 4000); // 10s → 6s
    if (now - this.lastTowerCheckTime > towerCheckRate) {
      this.manageTowers();
      this.lastTowerCheckTime = now;
    }

    // Ability management (check every 5 seconds)
    if (now - this.lastAbilityCheckTime > 5000) {
      this.manageAbilities();
      this.lastAbilityCheckTime = now;
    }
  }

  private updateAggression(): void {
    const state = this.gameManager.getState();

    // Analyze battlefield situation
    const playerUnitCount = state.units.filter(u => u.affiliation === 0).length;
    const aiUnitCount = state.units.filter(u => u.affiliation === 1).length;
    const healthRatio = state.aiHealth / Math.max(state.playerHealth, 1);
    const ageAdvantage = state.aiAge - state.playerAge;

    // Calculate aggression (simple but effective)
    let aggression = 0.5; // Base

    // Increase aggression if AI has more units
    if (aiUnitCount > playerUnitCount + 2) aggression += 0.2;

    // Increase aggression if AI has better health
    if (healthRatio > 1.3) aggression += 0.2;

    // Increase aggression if AI is ahead in age
    if (ageAdvantage > 0) aggression += 0.15 * ageAdvantage;

    // Decrease aggression if under pressure
    if (healthRatio < 0.6) aggression -= 0.3;
    if (playerUnitCount > aiUnitCount + 3) aggression -= 0.2;

    // Clamp between 0 and 1
    this.aggressionLevel = Math.max(0, Math.min(1, aggression));
  }

  private decideAction(): void {
    const state = this.gameManager.getState();
    const aiAgeData = AGES[state.aiAge];

    // Calculate strategic values
    const playerUnitCount = state.units.filter(u => u.affiliation === 0).length;
    const aiUnitCount = state.units.filter(u => u.affiliation === 1).length;
    const healthRatio = state.aiHealth / Math.max(state.playerHealth, 1);
    const isUnderPressure = healthRatio < 0.6 || (playerUnitCount > aiUnitCount + 3);
    const hasResourceAdvantage = state.aiGold > state.playerGold * 1.5;

    // Dynamic decision weights based on aggression and situation
    const evolveChance = isUnderPressure ? 0.3 : 0.8;
    const upgradeChance = hasResourceAdvantage ? 0.6 : (isUnderPressure ? 0.2 : 0.5);

    // Priority 1: Evolve strategically
    if (state.aiAge < AGES.length - 1 && state.aiXP >= aiAgeData.xpToEvolve) {
      if (this.difficulty === Difficulty.Hard) {
        // Always evolve on hard
        this.gameManager.evolveAI();
        return;
      } else if (Math.random() < evolveChance) {
        // Medium: Smarter evolution timing
        this.gameManager.evolveAI();
        return;
      }
    }

    // Priority 2: Smart upgrade purchasing
    const affordableUpgrades = aiAgeData.upgrades.filter(
      up => up.cost <= state.aiXP && !state.aiUpgrades.includes(up.name)
    );
    if (affordableUpgrades.length > 0 && Math.random() < upgradeChance) {
      // Prioritize based on situation
      let prioritizedUpgrade;

      if (isUnderPressure) {
        // Under pressure: health and defense
        prioritizedUpgrade = affordableUpgrades.find(up => up.stat === 'health') || affordableUpgrades[0];
      } else if (this.aggressionLevel > 0.7) {
        // Aggressive: damage upgrades
        prioritizedUpgrade = affordableUpgrades.find(up => up.stat === 'damage') || affordableUpgrades[0];
      } else {
        // Balanced: any upgrade
        prioritizedUpgrade = affordableUpgrades[Math.floor(Math.random() * affordableUpgrades.length)];
      }

      this.gameManager.upgradeAI(prioritizedUpgrade);
      return;
    }

    // Priority 3: Adaptive unit spawning
    const affordableUnits = aiAgeData.units.filter(u => u.cost <= state.aiGold);
    if (affordableUnits.length > 0) {
      let unitToSpawn;

      if (this.difficulty === Difficulty.Hard) {
        // Hard: Dynamic composition based on aggression
        this.unitMixCounter++;

        if (affordableUnits.length > 1) {
          if (this.aggressionLevel > 0.7) {
            // High aggression: More melee units (2:1 ratio)
            if (this.unitMixCounter % 3 === 0) {
              unitToSpawn = affordableUnits.reduce((prev, current) =>
                current.range > prev.range ? current : prev
              );
            } else {
              unitToSpawn = affordableUnits.reduce((prev, current) =>
                current.range < prev.range ? current : prev
              );
            }
          } else if (isUnderPressure) {
            // Defensive: Cheaper units for numbers
            unitToSpawn = affordableUnits.reduce((prev, current) =>
              current.cost < prev.cost ? current : prev
            );
          } else {
            // Balanced: Alternate evenly
            unitToSpawn = affordableUnits[this.unitMixCounter % affordableUnits.length];
          }
        } else {
          unitToSpawn = affordableUnits[0];
        }
      } else {
        // Medium: Adaptive but simpler
        if (isUnderPressure && affordableUnits.length > 1) {
          // Spawn cheaper units when defensive
          unitToSpawn = affordableUnits.reduce((prev, current) =>
            current.cost < prev.cost ? current : prev
          );
        } else {
          // Spawn most expensive when safe
          unitToSpawn = affordableUnits.reduce((prev, current) =>
            current.cost > prev.cost ? current : prev
          );
        }
      }

      this.gameManager.spawnAIUnit(unitToSpawn);
    }
  }

  private manageTowers(): void {
    const state = this.gameManager.getState();
    const aiAgeData = AGES[state.aiAge];

    // Only manage towers on hard difficulty
    if (this.difficulty !== Difficulty.Hard) return;

    // Check each tower slot
    for (const slot of state.aiTowers) {
      if (!slot.tower && state.aiGold >= 100) {
        // Build cheapest tower if slot is empty
        const cheapestTower = aiAgeData.towers.reduce((prev, current) =>
          (!current.upgradeFrom && current.cost < prev.cost) ? current : prev
        , aiAgeData.towers[0]);

        if (cheapestTower && state.aiGold >= cheapestTower.cost) {
          const towerIndex = aiAgeData.towers.findIndex(t => t.name === cheapestTower.name);
          this.gameManager.buildAITower(slot.id, towerIndex);
        }
      } else if (slot.tower) {
        // Try to upgrade existing tower
        const upgradeTower = aiAgeData.towers.find(
          t => t.upgradeFrom === slot.tower!.name
        );
        if (upgradeTower) {
          const upgradeCost = upgradeTower.cost - slot.tower.cost;
          if (state.aiGold >= upgradeCost) {
            const towerIndex = aiAgeData.towers.findIndex(t => t.name === upgradeTower.name);
            this.gameManager.upgradeAITower(slot.id, towerIndex);
          }
        }
      }
    }
  }

  private manageAbilities(): void {
    const state = this.gameManager.getState();
    const aiAgeData = AGES[state.aiAge];

    // Strategic ability purchasing and usage
    for (const ability of aiAgeData.abilities) {
      const isPurchased = state.aiAbilities.includes(ability.name);

      // Purchase abilities if affordable
      if (!isPurchased && state.aiXP >= ability.cost) {
        // Always purchase on hard, 70% chance on medium
        if (this.difficulty === Difficulty.Hard || Math.random() < 0.7) {
          this.gameManager.purchaseAbility(ability.name, Affiliation.AI);
          continue; // Don't use in same check
        }
      }

      // Use purchased abilities strategically
      if (isPurchased) {
        const cooldown = this.gameManager.getAbilityCooldown(ability.name);
        if (cooldown === 0) {
          let shouldUse = false;

          switch (ability.type) {
            case 'meteor_shower':
              // Use when there are enemy units on field
              const playerUnitCount = state.units.filter(u => u.affiliation === 0).length;
              shouldUse = playerUnitCount >= 2; // At least 2 enemy units
              break;

            case 'heal':
              // Use when health is below 70%
              const healthPercent = state.aiHealth / GAME_CONFIG.MAX_HEALTH;
              shouldUse = healthPercent < 0.7;
              break;

            case 'money_bonus':
              // Use opportunistically when low on gold or to build advantage
              shouldUse = state.aiGold < 300 || (this.aggressionLevel > 0.6 && Math.random() < 0.5);
              break;
          }

          if (shouldUse) {
            this.gameManager.useAbility(ability.name, Affiliation.AI);
          }
        }
      }
    }
  }

  public setDifficulty(difficulty: Difficulty): void {
    this.difficulty = difficulty;
  }
}