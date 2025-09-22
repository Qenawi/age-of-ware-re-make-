import type { GameManager } from './GameManager';
import { AGES, GAME_CONFIG } from './constants';

export class BotMind {
  private gameManager: GameManager;
  private lastActionTime: number = 0;

  constructor(gameManager: GameManager) {
    this.gameManager = gameManager;
  }

  update(now: number): void {
    if (now - this.lastActionTime > GAME_CONFIG.AI_SPAWN_RATE_MS) {
      this.decideAction();
      this.lastActionTime = now;
    }
  }

  private decideAction(): void {
    const state = this.gameManager.getState();
    const aiAgeData = AGES[state.aiAge];

    // Priority 1: Evolve if possible
    if (state.aiAge < AGES.length - 1 && state.aiXP >= aiAgeData.xpToEvolve) {
      this.gameManager.evolveAI();
      return;
    }

    // Priority 2: Buy an upgrade if possible
    const affordableUpgrades = aiAgeData.upgrades.filter(
        up => up.cost <= state.aiXP && !state.aiUpgrades.includes(up.name)
    );
    if (affordableUpgrades.length > 0) {
        // Simple logic: buy the first affordable upgrade
        this.gameManager.upgradeAI(affordableUpgrades[0]);
        return;
    }

    // Priority 3: Spawn a unit
    const affordableUnits = aiAgeData.units.filter(u => u.cost <= state.aiGold);
    if (affordableUnits.length > 0) {
      // Simple logic: spawn the strongest affordable unit
      const unitToSpawn = affordableUnits.reduce((prev, current) => (prev.cost > current.cost) ? prev : current);
      this.gameManager.spawnAIUnit(unitToSpawn);
    }
  }
}