import type { GameManager } from './GameManager';
import { AGES, GAME_CONFIG } from './constants';

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

  constructor(gameManager: GameManager, difficulty: Difficulty = Difficulty.Hard) {
    this.gameManager = gameManager;
    this.difficulty = difficulty;
  }

  update(now: number): void {
    const actionRate = this.difficulty === Difficulty.Hard
      ? GAME_CONFIG.AI_SPAWN_RATE_MS * 0.7  // 30% faster on hard
      : GAME_CONFIG.AI_SPAWN_RATE_MS;

    if (now - this.lastActionTime > actionRate) {
      this.decideAction();
      this.lastActionTime = now;
    }

    // Check towers less frequently
    if (now - this.lastTowerCheckTime > 10000) { // Every 10 seconds
      this.manageTowers();
      this.lastTowerCheckTime = now;
    }
  }

  private decideAction(): void {
    const state = this.gameManager.getState();
    const aiAgeData = AGES[state.aiAge];

    // Calculate strategic values
    const playerUnitCount = state.units.filter(u => u.affiliation === 0).length;
    const aiUnitCount = state.units.filter(u => u.affiliation === 1).length;
    const healthRatio = state.aiHealth / state.playerHealth;
    const isUnderPressure = aiUnitCount < playerUnitCount || healthRatio < 0.7;

    // Priority 1: Evolve if possible and strategic
    if (state.aiAge < AGES.length - 1 && state.aiXP >= aiAgeData.xpToEvolve) {
      // On hard mode, evolve immediately. On medium, wait if under pressure
      if (this.difficulty === Difficulty.Hard || !isUnderPressure) {
        this.gameManager.evolveAI();
        return;
      }
    }

    // Priority 2: Buy upgrades strategically
    const affordableUpgrades = aiAgeData.upgrades.filter(
      up => up.cost <= state.aiXP && !state.aiUpgrades.includes(up.name)
    );
    if (affordableUpgrades.length > 0 && !isUnderPressure) {
      // Prioritize damage upgrades when ahead, health when behind
      const prioritizedUpgrade = affordableUpgrades.find(up =>
        isUnderPressure ? up.stat === 'health' : up.stat === 'damage'
      ) || affordableUpgrades[0];

      this.gameManager.upgradeAI(prioritizedUpgrade);
      return;
    }

    // Priority 3: Spawn units with strategic mix
    const affordableUnits = aiAgeData.units.filter(u => u.cost <= state.aiGold);
    if (affordableUnits.length > 0) {
      let unitToSpawn;

      if (this.difficulty === Difficulty.Hard) {
        // Hard: Smart unit composition (mix of ranged and melee)
        this.unitMixCounter++;
        if (affordableUnits.length > 1) {
          // Alternate between units: 2 melee, 1 ranged pattern
          if (this.unitMixCounter % 3 === 0) {
            // Spawn ranged unit (higher range)
            unitToSpawn = affordableUnits.reduce((prev, current) =>
              current.range > prev.range ? current : prev
            );
          } else {
            // Spawn melee/cheaper unit
            unitToSpawn = affordableUnits.reduce((prev, current) =>
              current.range < prev.range ? current : prev
            );
          }
        } else {
          unitToSpawn = affordableUnits[0];
        }
      } else {
        // Medium: Simpler strategy - spawn most expensive
        unitToSpawn = affordableUnits.reduce((prev, current) =>
          current.cost > prev.cost ? current : prev
        );
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

  public setDifficulty(difficulty: Difficulty): void {
    this.difficulty = difficulty;
  }
}