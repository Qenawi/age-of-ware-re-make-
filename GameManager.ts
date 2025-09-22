import { GameState, GameStatus, Affiliation, UnitStats, Upgrade } from './types';
import { GAME_CONFIG, AGES } from './constants';
import { BotMind } from './BotMind';
import type { Character } from './characters/Character';
import { unitClasses } from './characters/units';

export class GameManager {
    private state: GameState;
    private onStateUpdate: ((state: GameState) => void) | null = null;
    private botMind: BotMind;
    private allUpgrades: Map<string, Upgrade>;

    constructor() {
        this.state = this.getInitialState();
        this.botMind = new BotMind(this);
        this.allUpgrades = new Map(AGES.flatMap(age => age.upgrades).map(up => [up.name, up]));
    }

    public setOnStateUpdate(onStateUpdate: (state: GameState) => void): void {
        this.onStateUpdate = onStateUpdate;
    }

    private getInitialState(): GameState {
        return {
            status: GameStatus.StartScreen,
            winner: null,
            playerHealth: GAME_CONFIG.MAX_HEALTH,
            playerGold: GAME_CONFIG.STARTING_GOLD,
            playerXP: GAME_CONFIG.STARTING_XP,
            playerAge: 0,
            playerUpgrades: [],
            aiHealth: GAME_CONFIG.MAX_HEALTH,
            aiGold: GAME_CONFIG.STARTING_GOLD,
            aiXP: GAME_CONFIG.STARTING_XP,
            aiAge: 0,
            aiUpgrades: [],
            units: [],
        };
    }

    public getState(): GameState {
        return { ...this.state };
    }
    
    public start(): void {
        this.state.status = GameStatus.Playing;
        this.notify();
    }
    
    public restart(): void {
        this.state = this.getInitialState();
        this.notify();
    }

    public update(deltaTime: number, now: number): void {
        if (this.state.status !== GameStatus.Playing) return;

        // Update resources
        this.state.playerGold += GAME_CONFIG.GOLD_PER_TICK * deltaTime;
        this.state.playerXP += GAME_CONFIG.XP_PER_TICK * deltaTime;
        this.state.aiGold += GAME_CONFIG.GOLD_PER_TICK * deltaTime;
        this.state.aiXP += GAME_CONFIG.XP_PER_TICK * deltaTime;

        // AI makes decisions
        this.botMind.update(now);

        // Update units
        this.state.units.forEach(unit => {
            unit.update(
              deltaTime, 
              this.state.units, 
              (damage) => this.state.playerHealth -= damage,
              (damage) => this.state.aiHealth -= damage
            );
        });

        // Handle deaths
        const newUnits: Character[] = [];
        let playerKills = 0;
        let aiKills = 0;
        
        for(const unit of this.state.units) {
            if (unit.isDead()) {
                if(unit.affiliation === Affiliation.Player) aiKills++;
                else playerKills++;
            } else {
                newUnits.push(unit);
            }
        }
        
        this.state.units = newUnits;
        
        // Update gold/xp from kills
        this.state.playerGold += playerKills * GAME_CONFIG.GOLD_PER_KILL;
        this.state.playerXP += playerKills * GAME_CONFIG.XP_PER_KILL;
        this.state.aiGold += aiKills * GAME_CONFIG.GOLD_PER_KILL;
        this.state.aiXP += aiKills * GAME_CONFIG.XP_PER_KILL;

        // Check win/loss
        if (this.state.playerHealth <= 0) {
            this.state.status = GameStatus.GameOver;
            this.state.winner = Affiliation.AI;
        } else if (this.state.aiHealth <= 0) {
            this.state.status = GameStatus.GameOver;
            this.state.winner = Affiliation.Player;
        }

        this.notify();
    }

    private applyUpgrades(baseStats: UnitStats, affiliation: Affiliation): UnitStats {
        const upgradedStats = { ...baseStats };
        const purchasedUpgradeNames = affiliation === Affiliation.Player ? this.state.playerUpgrades : this.state.aiUpgrades;

        for (const upgradeName of purchasedUpgradeNames) {
            const upgrade = this.allUpgrades.get(upgradeName);
            if (upgrade && upgrade.unitName === baseStats.name) {
                (upgradedStats[upgrade.stat] as number) += upgrade.value;
            }
        }
        return upgradedStats;
    }

    public spawnPlayerUnit(unitIndex: number): void {
        const ageData = AGES[this.state.playerAge];
        const baseUnitStats = ageData.units[unitIndex];
        if (this.state.playerGold >= baseUnitStats.cost) {
            this.state.playerGold -= baseUnitStats.cost;

            const finalUnitStats = this.applyUpgrades(baseUnitStats, Affiliation.Player);

            const x = GAME_CONFIG.PLAYER_BASE_X + GAME_CONFIG.UNIT_SPAWN_OFFSET;
            const UnitClass = unitClasses[finalUnitStats.name];
            if (UnitClass) {
              this.state.units.push(new UnitClass(finalUnitStats, Affiliation.Player, x));
              this.notify();
            }
        }
    }
    
    public evolvePlayer(): void {
        const ageData = AGES[this.state.playerAge];
        if (this.state.playerAge < AGES.length - 1 && this.state.playerXP >= ageData.xpToEvolve) {
            this.state.playerAge++;
            this.state.playerXP -= ageData.xpToEvolve;
            this.notify();
        }
    }

    public upgradePlayer(upgradeIndex: number): void {
        const ageData = AGES[this.state.playerAge];
        const upgrade = ageData.upgrades[upgradeIndex];
        if (upgrade && this.state.playerXP >= upgrade.cost && !this.state.playerUpgrades.includes(upgrade.name)) {
            this.state.playerXP -= upgrade.cost;
            this.state.playerUpgrades.push(upgrade.name);
            this.notify();
        }
    }

    // Methods for BotMind
    public spawnAIUnit(unitStats: UnitStats): void {
        if (this.state.aiGold >= unitStats.cost) {
            this.state.aiGold -= unitStats.cost;
            const finalUnitStats = this.applyUpgrades(unitStats, Affiliation.AI);
            const x = GAME_CONFIG.AI_BASE_X - GAME_CONFIG.UNIT_SPAWN_OFFSET;
            const UnitClass = unitClasses[finalUnitStats.name];
            if (UnitClass) {
              this.state.units.push(new UnitClass(finalUnitStats, Affiliation.AI, x));
            }
        }
    }

    public evolveAI(): void {
        const ageData = AGES[this.state.aiAge];
        if (this.state.aiAge < AGES.length - 1 && this.state.aiXP >= ageData.xpToEvolve) {
            this.state.aiAge++;
            this.state.aiXP -= ageData.xpToEvolve;
        }
    }

    public upgradeAI(upgrade: Upgrade): void {
        if (upgrade && this.state.aiXP >= upgrade.cost && !this.state.aiUpgrades.includes(upgrade.name)) {
            this.state.aiXP -= upgrade.cost;
            this.state.aiUpgrades.push(upgrade.name);
        }
    }

    private notify(): void {
        if (this.onStateUpdate) {
            this.onStateUpdate({ ...this.state, units: [...this.state.units] });
        }
    }
}