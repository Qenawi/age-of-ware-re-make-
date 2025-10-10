import { GameState, GameStatus, Affiliation, UnitStats, Upgrade, BuildQueueItem, TowerSlot, TowerStats, Ability } from './types';
import { GAME_CONFIG, AGES } from './constants';
import { BotMind, Difficulty } from './BotMind';
import type { Character } from './characters/Character';
import { unitClasses } from './characters/units';

export { Difficulty };

export class GameManager {
    private state: GameState;
    private onStateUpdate: ((state: GameState) => void) | null = null;
    private botMind: BotMind;
    private allUpgrades: Map<string, Upgrade>;
    private allAbilities: Map<string, Ability>;
    private difficulty: Difficulty;

    constructor(difficulty: Difficulty = Difficulty.Hard) {
        this.difficulty = difficulty;
        this.state = this.getInitialState();
        this.botMind = new BotMind(this, difficulty);
        this.allUpgrades = new Map(AGES.flatMap(age => age.upgrades).map(up => [up.name, up]));
        this.allAbilities = new Map(AGES.flatMap(age => age.abilities).map(ab => [ab.name, { ...ab }]));
    }

    public setOnStateUpdate(onStateUpdate: (state: GameState) => void): void {
        this.onStateUpdate = onStateUpdate;
    }

    public setDifficulty(difficulty: Difficulty): void {
        this.difficulty = difficulty;
        this.botMind.setDifficulty(difficulty);
    }

    public getDifficulty(): Difficulty {
        return this.difficulty;
    }

    private getInitialState(): GameState {
        // Initialize tower slots - 2 per base
        const playerTowers: TowerSlot[] = [
            { id: 0, tower: null, x: GAME_CONFIG.PLAYER_BASE_X + 40, y: 250 },
            { id: 1, tower: null, x: GAME_CONFIG.PLAYER_BASE_X + 40, y: 350 },
        ];
        const aiTowers: TowerSlot[] = [
            { id: 0, tower: null, x: GAME_CONFIG.AI_BASE_X - 40, y: 250 },
            { id: 1, tower: null, x: GAME_CONFIG.AI_BASE_X - 40, y: 350 },
        ];

        // Fairer starting resources - AI gets small advantage that grows over time
        const aiGoldMultiplier = this.difficulty === Difficulty.Hard ? 1.3 : 1;

        return {
            status: GameStatus.StartScreen,
            winner: null,
            playerHealth: GAME_CONFIG.MAX_HEALTH,
            playerGold: GAME_CONFIG.STARTING_GOLD,
            playerXP: GAME_CONFIG.STARTING_XP,
            playerAge: 0,
            playerUpgrades: [],
            playerBuildQueue: [],
            playerTowers,
            playerAbilities: [],
            aiHealth: GAME_CONFIG.MAX_HEALTH,
            aiGold: GAME_CONFIG.STARTING_GOLD * aiGoldMultiplier,
            aiXP: GAME_CONFIG.STARTING_XP,
            aiAge: 0,
            aiUpgrades: [],
            aiBuildQueue: [],
            aiTowers,
            aiAbilities: [],
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

        // Update resources (with dynamic multipliers that grow over time)
        const gameTimeSeconds = (now - (this.botMind as any).gameStartTime) / 1000;
        const timeProgress = Math.min(gameTimeSeconds / 180, 1); // 0 to 1 over 3 minutes

        // Resource multipliers that scale with time
        const aiGoldMultiplier = this.difficulty === Difficulty.Hard
            ? 1.2 + (timeProgress * 1.0)  // Grows from 1.2x to 2.2x
            : 1.0 + (timeProgress * 0.3); // Grows from 1x to 1.3x

        const aiXPMultiplier = this.difficulty === Difficulty.Hard
            ? 1.2 + (timeProgress * 0.6)  // Grows from 1.2x to 1.8x
            : 1.0 + (timeProgress * 0.2); // Grows from 1x to 1.2x

        this.state.playerGold += GAME_CONFIG.GOLD_PER_TICK * deltaTime;
        this.state.playerXP += GAME_CONFIG.XP_PER_TICK * deltaTime;
        this.state.aiGold += GAME_CONFIG.GOLD_PER_TICK * deltaTime * aiGoldMultiplier;
        this.state.aiXP += GAME_CONFIG.XP_PER_TICK * deltaTime * aiXPMultiplier;

        // Update build queues
        this.updateBuildQueue(deltaTime);

        // AI makes decisions
        this.botMind.update(now);

        // Update towers
        this.updateTowers(deltaTime);

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
            // Clear all units and build queues when game ends
            this.state.units = [];
            this.state.playerBuildQueue = [];
            this.state.aiBuildQueue = [];
        } else if (this.state.aiHealth <= 0) {
            this.state.status = GameStatus.GameOver;
            this.state.winner = Affiliation.Player;
            // Clear all units and build queues when game ends
            this.state.units = [];
            this.state.playerBuildQueue = [];
            this.state.aiBuildQueue = [];
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

    private updateBuildQueue(deltaTime: number): void {
        const deltaMs = deltaTime * 1000;

        // Update player queue
        if (this.state.playerBuildQueue.length > 0) {
            const currentBuild = this.state.playerBuildQueue[0];
            currentBuild.timeRemaining -= deltaMs;

            if (currentBuild.timeRemaining <= 0) {
                // Spawn the unit
                const x = GAME_CONFIG.PLAYER_BASE_X + GAME_CONFIG.UNIT_SPAWN_OFFSET;
                const UnitClass = unitClasses[currentBuild.unitStats.name];
                if (UnitClass) {
                    this.state.units.push(new UnitClass(currentBuild.unitStats, Affiliation.Player, x));
                }
                // Remove from queue
                this.state.playerBuildQueue.shift();
            }
        }

        // Update AI queue
        if (this.state.aiBuildQueue.length > 0) {
            const currentBuild = this.state.aiBuildQueue[0];
            currentBuild.timeRemaining -= deltaMs;

            if (currentBuild.timeRemaining <= 0) {
                // Spawn the unit
                const x = GAME_CONFIG.AI_BASE_X - GAME_CONFIG.UNIT_SPAWN_OFFSET;
                const UnitClass = unitClasses[currentBuild.unitStats.name];
                if (UnitClass) {
                    this.state.units.push(new UnitClass(currentBuild.unitStats, Affiliation.AI, x));
                }
                // Remove from queue
                this.state.aiBuildQueue.shift();
            }
        }
    }

    private updateTowers(deltaTime: number): void {
        // Player towers attack AI units
        this.state.playerTowers.forEach(slot => {
            if (!slot.tower) return;

            // Track attack cooldown
            if (!slot.tower.lastAttackTime) {
                slot.tower.lastAttackTime = 0;
            }

            const cooldown = 1000 / slot.tower.attackSpeed; // Convert attacks per second to milliseconds
            const now = performance.now();

            if (now - slot.tower.lastAttackTime >= cooldown) {
                // Find closest enemy unit in range
                const target = this.state.units
                    .filter(unit => unit.affiliation === Affiliation.AI && !unit.isDead())
                    .find(unit => Math.abs(unit.x - slot.x) <= slot.tower!.range);

                if (target) {
                    target.takeDamage(slot.tower.damage);
                    slot.tower.lastAttackTime = now;
                }
            }
        });

        // AI towers attack Player units
        this.state.aiTowers.forEach(slot => {
            if (!slot.tower) return;

            // Track attack cooldown
            if (!slot.tower.lastAttackTime) {
                slot.tower.lastAttackTime = 0;
            }

            const cooldown = 1000 / slot.tower.attackSpeed;
            const now = performance.now();

            if (now - slot.tower.lastAttackTime >= cooldown) {
                // Find closest enemy unit in range
                const target = this.state.units
                    .filter(unit => unit.affiliation === Affiliation.Player && !unit.isDead())
                    .find(unit => Math.abs(unit.x - slot.x) <= slot.tower!.range);

                if (target) {
                    target.takeDamage(slot.tower.damage);
                    slot.tower.lastAttackTime = now;
                }
            }
        });
    }

    public spawnPlayerUnit(unitIndex: number): void {
        const ageData = AGES[this.state.playerAge];
        const baseUnitStats = ageData.units[unitIndex];
        if (this.state.playerGold >= baseUnitStats.cost) {
            this.state.playerGold -= baseUnitStats.cost;

            const finalUnitStats = this.applyUpgrades(baseUnitStats, Affiliation.Player);
            const buildTime = (GAME_CONFIG.UNIT_BUILD_TIMES as any)[finalUnitStats.name] || 2000;

            // Add to build queue
            this.state.playerBuildQueue.push({
                unitStats: finalUnitStats,
                affiliation: Affiliation.Player,
                timeRemaining: buildTime,
            });

            this.notify();
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

    // Tower Methods
    public buildPlayerTower(slotId: number, towerIndex: number): void {
        const ageData = AGES[this.state.playerAge];
        const tower = ageData.towers[towerIndex];
        const slot = this.state.playerTowers.find(s => s.id === slotId);

        if (slot && !slot.tower && this.state.playerGold >= tower.cost) {
            this.state.playerGold -= tower.cost;
            slot.tower = { ...tower };
            this.notify();
        }
    }

    public upgradePlayerTower(slotId: number, newTowerIndex: number): void {
        const ageData = AGES[this.state.playerAge];
        const newTower = ageData.towers[newTowerIndex];
        const slot = this.state.playerTowers.find(s => s.id === slotId);

        if (slot && slot.tower && newTower.upgradeFrom === slot.tower.name) {
            const upgradeCost = newTower.cost - slot.tower.cost;
            if (this.state.playerGold >= upgradeCost) {
                this.state.playerGold -= upgradeCost;
                slot.tower = { ...newTower };
                this.notify();
            }
        }
    }

    public sellPlayerTower(slotId: number): void {
        const slot = this.state.playerTowers.find(s => s.id === slotId);

        if (slot && slot.tower) {
            this.state.playerGold += slot.tower.sellValue;
            slot.tower = null;
            this.notify();
        }
    }

    // AI Tower Methods
    public buildAITower(slotId: number, towerIndex: number): void {
        const ageData = AGES[this.state.aiAge];
        const tower = ageData.towers[towerIndex];
        const slot = this.state.aiTowers.find(s => s.id === slotId);

        if (slot && !slot.tower && this.state.aiGold >= tower.cost) {
            this.state.aiGold -= tower.cost;
            slot.tower = { ...tower };
        }
    }

    public upgradeAITower(slotId: number, newTowerIndex: number): void {
        const ageData = AGES[this.state.aiAge];
        const newTower = ageData.towers[newTowerIndex];
        const slot = this.state.aiTowers.find(s => s.id === slotId);

        if (slot && slot.tower && newTower.upgradeFrom === slot.tower.name) {
            const upgradeCost = newTower.cost - slot.tower.cost;
            if (this.state.aiGold >= upgradeCost) {
                this.state.aiGold -= upgradeCost;
                slot.tower = { ...newTower };
            }
        }
    }

    // Ability Methods
    public purchaseAbility(abilityName: string, affiliation: Affiliation = Affiliation.Player): void {
        const ability = this.allAbilities.get(abilityName);
        if (!ability) return;

        const purchasedAbilities = affiliation === Affiliation.Player ? this.state.playerAbilities : this.state.aiAbilities;
        const xp = affiliation === Affiliation.Player ? this.state.playerXP : this.state.aiXP;

        if (xp >= ability.cost && !purchasedAbilities.includes(abilityName)) {
            if (affiliation === Affiliation.Player) {
                this.state.playerXP -= ability.cost;
                this.state.playerAbilities.push(abilityName);
            } else {
                this.state.aiXP -= ability.cost;
                this.state.aiAbilities.push(abilityName);
            }
            this.notify();
        }
    }

    public useAbility(abilityName: string, affiliation: Affiliation = Affiliation.Player): boolean {
        const ability = this.allAbilities.get(abilityName);
        if (!ability) return false;

        const purchasedAbilities = affiliation === Affiliation.Player ? this.state.playerAbilities : this.state.aiAbilities;

        // Check if ability is purchased
        if (!purchasedAbilities.includes(abilityName)) return false;

        // Check cooldown
        const now = performance.now();
        if (ability.lastUsedTime && (now - ability.lastUsedTime) < ability.cooldown) {
            return false;
        }

        // Execute ability effect
        let success = false;
        switch (ability.type) {
            case 'meteor_shower':
                success = this.executeMeteorShower(ability, affiliation);
                break;
            case 'heal':
                success = this.executeHeal(ability, affiliation);
                break;
            case 'money_bonus':
                success = this.executeMoneyBonus(ability, affiliation);
                break;
        }

        if (success) {
            ability.lastUsedTime = now;
            this.notify();
        }

        return success;
    }

    private executeMeteorShower(ability: Ability, affiliation: Affiliation): boolean {
        const damage = ability.damage || 0;
        const targetAffiliation = affiliation === Affiliation.Player ? Affiliation.AI : Affiliation.Player;

        // Damage all enemy units
        let hitCount = 0;
        this.state.units.forEach(unit => {
            if (unit.affiliation === targetAffiliation && !unit.isDead()) {
                unit.takeDamage(damage);
                hitCount++;
            }
        });

        return hitCount > 0 || this.state.units.length === 0; // Success if hit units or no units to hit
    }

    private executeHeal(ability: Ability, affiliation: Affiliation): boolean {
        const healAmount = ability.healAmount || 0;

        if (affiliation === Affiliation.Player) {
            const maxHeal = GAME_CONFIG.MAX_HEALTH - this.state.playerHealth;
            const actualHeal = Math.min(healAmount, maxHeal);
            if (actualHeal > 0) {
                this.state.playerHealth += actualHeal;
                return true;
            }
        } else {
            const maxHeal = GAME_CONFIG.MAX_HEALTH - this.state.aiHealth;
            const actualHeal = Math.min(healAmount, maxHeal);
            if (actualHeal > 0) {
                this.state.aiHealth += actualHeal;
                return true;
            }
        }

        return false; // Already at max health
    }

    private executeMoneyBonus(ability: Ability, affiliation: Affiliation): boolean {
        const goldAmount = ability.goldAmount || 0;

        if (affiliation === Affiliation.Player) {
            this.state.playerGold += goldAmount;
        } else {
            this.state.aiGold += goldAmount;
        }

        return true;
    }

    public getAbilityCooldown(abilityName: string): number {
        const ability = this.allAbilities.get(abilityName);
        if (!ability || !ability.lastUsedTime) return 0;

        const now = performance.now();
        const timeSinceUse = now - ability.lastUsedTime;
        const remaining = Math.max(0, ability.cooldown - timeSinceUse);

        return remaining;
    }

    private notify(): void {
        if (this.onStateUpdate) {
            this.onStateUpdate({ ...this.state, units: [...this.state.units] });
        }
    }
}