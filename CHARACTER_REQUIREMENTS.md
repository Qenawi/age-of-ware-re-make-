# Character Asset Requirements

This document lists all combat units that need to be produced in PixelLab, along with the minimum animation sets and the gameplay upgrades they are tied to. Use it as a checklist while generating 2D characters.

## Stone Age Units

| Unit | Battlefield Role | Required Animations | Associated Upgrades |
| --- | --- | --- | --- |
| **Clubman** | Short-range melee bruiser with a wooden club. | *Idle/Ready*, *Walk/Run Cycle*, *Melee Attack Swing*, *Hit/Flinch*, *Death/Defeat*. | **Sharpened Sticks** – +5 damage, **Tougher Hide** – +20 health. |
| **Slingshot** | Mid-range projectile thrower using a sling. | *Idle/Ready*, *Walk/Run Cycle*, *Ranged Attack (sling release)*, *Hit/Flinch*, *Death/Defeat*, optional *Projectile rock* sprite. | **Bigger Rocks** – +5 damage. |

## Bronze Age Units

| Unit | Battlefield Role | Required Animations | Associated Upgrades |
| --- | --- | --- | --- |
| **Swordsman** | Armored melee soldier wielding a bronze sword and shield. | *Idle/Ready*, *Walk/Run Cycle*, *Melee Attack (sword slash)*, *Block/Hit Reaction*, *Death/Defeat*. | **Bronze Swords** – +10 damage, **Chainmail** – +50 health. |
| **Archer** | Long-range bow unit with light armor. | *Idle/Ready*, *Walk/Run Cycle*, *Ranged Attack (draw & release)*, *Hit/Flinch*, *Death/Defeat*, optional *Arrow projectile* sprite. | **Composite Bows** – +25 range. |

## Future Age Units

| Unit | Battlefield Role | Required Animations | Associated Upgrades |
| --- | --- | --- | --- |
| **Cyborg** | Heavy cybernetic melee specialist with energy blade. | *Idle/Power-up*, *Walk/Run Cycle*, *Melee Attack (plasma blade)*, *Hit/Shield Flicker*, *Death/Shutdown*. | **Plasma Blade** – +25 damage, **Titanium Armor** – +100 health. |
| **Laser Trooper** | High-tech ranged trooper firing continuous laser bursts. | *Idle/Ready*, *Walk/Run Cycle*, *Ranged Attack (laser firing)*, *Hit/Flinch*, *Death/Defeat*, optional *Laser beam* effect. | **Long-Range Scope** – +50 range. |

## General Notes

- Keep each unit roughly within its configured in-game footprint (≈70–76 px square) so they scale consistently.
- Maintain a left-to-right facing orientation for default sprites; create mirrored variants in-engine if needed.
- Optional additional animations (victory pose, spawn/warp-in, etc.) are welcome but not required.
- Ensure color palettes and silhouettes communicate each age's technology level for quick player recognition.
