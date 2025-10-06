# PixelLab Commands for Age of War Assets

## Battlefield Background Generation

### Stone Age Battlefield
```
Stone Age battlefield background:
Prehistoric wilderness scene, 1200x600 pixels.
Rocky landscape with cave entrances on the sides, dirt fighting path in center.
Dawn sky with orange and purple hues, scattered boulders and primitive totems.
Earth tone color palette (browns, greens, grays).
Keep bottom 120 pixels clear for units, center combat zone uncluttered.
Side-view perspective, atmospheric depth.
```

### Bronze Age Battlefield
```
Bronze Age battlefield background:
Ancient civilization warzone, 1200x600 pixels.
Stone fortifications and ancient temples in background, cobblestone fighting path.
Clear sky or dramatic storm clouds, bronze decorative elements and banners.
Sandy tones, bronze colors, stone grays, deep blues.
Keep bottom 120 pixels clear for units, center combat zone uncluttered.
Side-view perspective, atmospheric depth.
```

### Future Age Battlefield
```
Future Age battlefield background:
Futuristic sci-fi battlefield, 1200x600 pixels.
Neon-lit cityscape with holographic displays and flying vehicles in background.
Metallic platform fighting surface with holographic grid patterns.
Neon blue, cyan, purple, metallic silver color palette.
Keep bottom 120 pixels clear for units, center combat zone uncluttered.
Side-view perspective, atmospheric depth with tech elements.
```

## Character Animation Generation

### Clubman (Stone Age - Already Complete)
```
Clubman:
Short-range melee bruiser with a wooden club.

Animation:
Idle/Ready, Walk/Run Cycle, Melee Attack Swing, Hit/Flinch, Death/Defeat.

Upgrades:
Sharpened Sticks
Tougher Hide
```

### Slingshot (Stone Age)
```
Slingshot:
Mid-range projectile thrower using a primitive sling weapon.

Animation:
Idle/Ready, Walk/Run Cycle, Ranged Attack (sling release), Hit/Flinch, Death/Defeat.

Upgrades:
Bigger Rocks
```

**Detailed Animation Breakdown for Slingshot:**
- **Size**: 64x64 pixels
- **View**: Low top-down (8 directions)
- **Animations needed**:
  - `breathing-idle` (4 frames) - Relaxed stance
  - `walk` (6 frames) - Agile movement with sling at side
  - `sling-attack` (6 frames) - Wind-up → Release → Recovery
  - `hit-reaction` (4 frames) - Flinch when taking damage
  - `falling-back-death` (7 frames) - Stumble and collapse

### Swordsman (Bronze Age)
```
Swordsman:
Armored melee soldier wielding a bronze sword and shield.

Animation:
Idle/Ready, Walk/Run Cycle, Melee Attack (sword slash), Block/Hit Reaction, Death/Defeat.

Upgrades:
Bronze Swords
Chainmail
```

### Archer (Bronze Age)
```
Archer:
Long-range bow unit with light armor.

Animation:
Idle/Ready, Walk/Run Cycle, Ranged Attack (draw and release bow), Hit/Flinch, Death/Defeat.

Upgrades:
Composite Bows
```

### Cyborg (Future Age)
```
Cyborg:
Heavy cybernetic melee specialist with energy blade.

Animation:
Idle/Power-up, Walk/Run Cycle, Melee Attack (plasma blade slash), Hit/Shield Flicker, Death/Shutdown.

Upgrades:
Plasma Blade
Titanium Armor
```

### Laser Trooper (Future Age)
```
Laser Trooper:
High-tech ranged trooper firing continuous laser bursts.

Animation:
Idle/Ready, Walk/Run Cycle, Ranged Attack (laser firing stance), Hit/Flinch, Death/Defeat.

Upgrades:
Long-Range Scope
```

## General Character Specifications

### All Characters Must Have:
- **Size**: 64x64 pixels (standard footprint)
- **View**: Low top-down perspective
- **Directions**: 8 (N, NE, E, SE, S, SW, W, NW) - Currently only East is used
- **Frame Format**: PNG with transparency

### Required Animations (mapped to game logic):
1. **breathing-idle** → `idle` status
2. **walk** → `walking` status (6 frames)
3. **[attack-type]** → `attacking` status (6 frames)
   - Melee: `cross-punch`, `sword-slash`, `plasma-blade`
   - Ranged: `sling-attack`, `bow-attack`, `laser-fire`
4. **falling-back-death** → `dead` status (7 frames)
5. **hit-reaction** → damage flash (4 frames, optional)

## Export Settings for PixelLab

### For Backgrounds:
- **Format**: PNG
- **Dimensions**: 1200 x 600 pixels
- **Export path**: Save to `public/assets/backgrounds/`
- **Naming convention**:
  - `stone-age-battlefield.png`
  - `bronze-age-battlefield.png`
  - `future-age-battlefield.png`

### For Characters:
- **Format**: PNG with transparency
- **Dimensions**: 64 x 64 pixels per frame
- **Export structure**:
  ```
  characters/[unit-name]/
    animations/
      [animation-name]/
        east/
          frame_000.png
          frame_001.png
          ...
  ```

## Quick Reference Table

| Unit | Type | Range | Animations Needed |
|------|------|-------|-------------------|
| ✅ Clubman | Melee | 5px | Complete |
| ⏳ Slingshot | Ranged | 150px | breathing-idle, walk, sling-attack, hit-reaction, falling-back-death |
| ⏳ Swordsman | Melee | 5px | breathing-idle, walk, sword-slash, block-reaction, falling-back-death |
| ⏳ Archer | Ranged | 200px | breathing-idle, walk, bow-attack, hit-reaction, falling-back-death |
| ⏳ Cyborg | Melee | 10px | power-idle, walk, plasma-slash, shield-flicker, shutdown-death |
| ⏳ Laser Trooper | Ranged | 250px | breathing-idle, walk, laser-fire, hit-reaction, falling-back-death |

## Tips for Best Results

1. **Keep prompts concise** - PixelLab works best with clear, structured descriptions
2. **Specify pixel dimensions** - Always include size requirements
3. **Mention perspective** - "Low top-down view" or "Side-view perspective"
4. **List color palette** - Helps maintain theme consistency
5. **Frame count** - Specify number of frames needed for animations
6. **Clear fighting zones** - Remind about gameplay space requirements for backgrounds
