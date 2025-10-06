# Tower System Implementation Guide

## Overview
Tower defense system where each base has 2 tower slots. Towers can be built, upgraded, and sold.

## Current Progress

### ✅ Completed
1. **Type Definitions** (types.ts)
   - `TowerStats` interface
   - `TowerSlot` interface
   - Added `towers: TowerStats[]` to Age interface
   - Added `playerTowers` and `aiTowers` to GameState

2. **Game State Initialization** (GameManager.ts:23-52)
   - 2 tower slots per base
   - Player towers at x=100, y=250 and y=350
   - AI towers at x=1020, y=250 and y=350

### 🔨 TODO

#### 1. Add Tower Definitions to constants.ts

```typescript
// Add to each AGE in AGES array:
towers: [
  // Stone Age
  {
    name: "Stone Tower",
    cost: 100,
    damage: 10,
    range: 150,
    attackSpeed: 1,
    sellValue: 50,
    image: "/assets/towers/stone-tower.png"
  },
  {
    name: "Catapult",
    cost: 200,
    damage: 25,
    range: 200,
    attackSpeed: 0.5,
    sellValue: 100,
    image: "/assets/towers/catapult.png",
    upgradeFrom: "Stone Tower" // Can upgrade from Stone Tower
  }
],

// Bronze Age
towers: [
  {
    name: "Ballista",
    cost: 300,
    damage: 40,
    range: 250,
    attackSpeed: 0.8,
    sellValue: 150,
    image: "/assets/towers/ballista.png",
    upgradeFrom: "Catapult"
  },
  {
    name: "Guard Tower",
    cost: 400,
    damage: 30,
    range: 180,
    attackSpeed: 1.5,
    sellValue: 200,
    image: "/assets/towers/guard-tower.png"
  }
],

// Future Age
towers: [
  {
    name: "Laser Turret",
    cost: 800,
    damage: 80,
    range: 300,
    attackSpeed: 2,
    sellValue: 400,
    image: "/assets/towers/laser-turret.png",
    upgradeFrom: "Ballista"
  },
  {
    name: "Plasma Cannon",
    cost: 1000,
    damage: 120,
    range: 280,
    attackSpeed: 1,
    sellValue: 500,
    image: "/assets/towers/plasma-cannon.png",
    upgradeFrom: "Guard Tower"
  }
]
```

#### 2. Add Tower Methods to GameManager.ts

```typescript
// Build tower
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

// Upgrade tower
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

// Sell tower
public sellPlayerTower(slotId: number): void {
  const slot = this.state.playerTowers.find(s => s.id === slotId);

  if (slot && slot.tower) {
    this.state.playerGold += slot.tower.sellValue;
    slot.tower = null;
    this.notify();
  }
}

// Tower attack logic (add to update method)
private updateTowers(deltaTime: number): void {
  // Player towers
  this.state.playerTowers.forEach(slot => {
    if (!slot.tower) return;

    // Find enemy units in range
    const target = this.state.units.find(unit =>
      unit.affiliation === Affiliation.AI &&
      Math.abs(unit.x - slot.x) <= slot.tower!.range
    );

    if (target && !target.isDead()) {
      // Tower attacks (similar to unit attack cooldown)
      target.takeDamage(slot.tower.damage);
    }
  });

  // AI towers (same logic)
}
```

#### 3. Create Tower UI Component

```tsx
// components/TowerSlot.tsx
interface TowerSlotProps {
  slot: TowerSlot;
  availableTowers: TowerStats[];
  playerGold: number;
  onBuild: (towerIndex: number) => void;
  onUpgrade: (towerIndex: number) => void;
  onSell: () => void;
}

const TowerSlotComponent: React.FC<TowerSlotProps> = ({
  slot,
  availableTowers,
  playerGold,
  onBuild,
  onUpgrade,
  onSell
}) => {
  const [showMenu, setShowMenu] = useState(false);

  if (!slot.tower) {
    // Show build menu
    return (
      <div className="absolute" style={{ left: slot.x, top: slot.y }}>
        <button onClick={() => setShowMenu(!showMenu)}>
          + Build Tower
        </button>
        {showMenu && (
          <div className="tower-menu">
            {availableTowers.map((tower, idx) => (
              <button
                key={tower.name}
                onClick={() => onBuild(idx)}
                disabled={playerGold < tower.cost}
              >
                {tower.name} - ${tower.cost}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Show existing tower with upgrade/sell options
  return (
    <div className="absolute" style={{ left: slot.x, top: slot.y }}>
      <img src={slot.tower.image} alt={slot.tower.name} />
      <div className="tower-controls">
        {/* Upgrade button */}
        {availableTowers
          .filter(t => t.upgradeFrom === slot.tower!.name)
          .map((upgradeTower, idx) => (
            <button
              key={upgradeTower.name}
              onClick={() => onUpgrade(idx)}
              disabled={playerGold < (upgradeTower.cost - slot.tower!.cost)}
            >
              Upgrade to {upgradeTower.name}
            </button>
          ))}

        {/* Sell button */}
        <button onClick={onSell}>
          Sell (+${slot.tower.sellValue})
        </button>
      </div>
    </div>
  );
};
```

#### 4. Tower Assets Needed

Create `/public/assets/towers/` directory with:
- `stone-tower.png`
- `catapult.png`
- `ballista.png`
- `guard-tower.png`
- `laser-turret.png`
- `plasma-cannon.png`

**Specifications:**
- Size: 80x80 pixels
- Format: PNG with transparency
- Style: Match era themes

#### 5. PixelLab Prompts for Towers

**Stone Age:**
```
Stone Tower: Primitive stone fortification tower, 80x80 pixels, top-down view, pixel art
Catapult: Wooden catapult with stone ammunition, 80x80 pixels, pixel art
```

**Bronze Age:**
```
Ballista: Ancient bronze ballista siege weapon, 80x80 pixels, pixel art
Guard Tower: Stone tower with bronze reinforcements and archer platform, 80x80 pixels, pixel art
```

**Future Age:**
```
Laser Turret: Futuristic laser weapon turret with neon blue lights, 80x80 pixels, pixel art
Plasma Cannon: High-tech plasma cannon with glowing energy core, 80x80 pixels, pixel art
```

## Tower Upgrade Path Examples

Stone Age → Bronze Age → Future Age
- Stone Tower → Catapult → Ballista → Laser Turret
- (New) → Guard Tower → (Upgrade) → Plasma Cannon

## Implementation Steps

1. ✅ Add type definitions
2. ✅ Initialize tower slots in game state
3. ⏳ Add tower definitions to constants.ts
4. ⏳ Implement tower methods in GameManager
5. ⏳ Create Tower UI component
6. ⏳ Add tower attack logic to game loop
7. ⏳ Create tower assets
8. ⏳ Wire up UI in App.tsx

## Notes
- Towers attack automatically within range
- Selling gives 50% gold back
- Upgrades cost the difference between tower prices
- Each era unlocks new towers
- AI can build towers too (optional, for balance)