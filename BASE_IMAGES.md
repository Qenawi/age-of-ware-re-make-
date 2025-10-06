# Base Images Guide

## Overview
Base structures for each age in the game. Each team has a base that units attack.

## Directory Structure
```
public/assets/bases/
├── stone-age-base.png
├── bronze-age-base.png
└── future-age-base.png
```

## Image Specifications

### Dimensions
- **Height**: 192px (h-48 class in App.tsx)
- **Width**: Proportional to height (typically ~150-200px)
- **Format**: PNG with transparency

### Design Guidelines

#### Stone Age Base
**Theme**: Primitive fortification
- **Structure**: Cave entrance, wooden palisade, or stone pile
- **Materials**: Rough stone, logs, animal hides
- **Details**: Primitive totems, bone decorations, fire pit
- **Color Palette**: Earth tones (browns, grays, dark greens)

#### Bronze Age Base
**Theme**: Ancient fortress
- **Structure**: Stone tower, brick fortification, or temple gate
- **Materials**: Cut stone blocks, bronze reinforcements
- **Details**: Banners, bronze shields, pillars
- **Color Palette**: Stone gray, bronze/copper tones, faded reds

#### Future Age Base
**Theme**: High-tech bunker
- **Structure**: Metallic structure with energy shields, holographic displays
- **Materials**: Metal panels, glowing circuitry, force fields
- **Details**: Neon lights, antenna arrays, digital displays
- **Color Palette**: Metallic silver, neon blue/cyan, dark grays

## Visual Positioning

### In-Game Placement
- **Player Base**: Left side at x=60px
- **AI Base**: Right side at x=1080px (flipped horizontally)
- **Ground Alignment**: bottom = PLAYFIELD_GROUND_OFFSET - 20px (90px from bottom)

### Base Health Indicators
- Health is shown in top header bars
- Bases don't have individual health bars (unlike units)
- Visual damage can be added later as optional feature

## Integration Notes

### Current Implementation (constants.ts)
```typescript
{
  name: "Stone Age",
  baseImage: `/assets/bases/stone-age-base.png`,
  // ...
}
```

### Rendering (App.tsx)
```tsx
<img
  src={playerBaseImg}
  className="absolute h-48"
  style={{
    left: `${PLAYER_BASE_X - 100}px`,
    bottom: `${PLAYFIELD_GROUND_OFFSET - 20}px`,
  }}
/>
```

## Design Tips

1. **Silhouette**: Create distinct shapes for each era
2. **Symmetry**: Bases should look good when flipped (AI side)
3. **Ground Integration**: Add shadow/foundation at bottom
4. **Visibility**: Keep central area clear for health targeting
5. **Scale**: Bases should be imposing but not block battlefield view

## Attack Zones

Units can attack bases when within range:
- **Melee units**: Extended 60px range for base attacks
- **Ranged units**: Normal range applies
- **Attack distance**: Measured from unit x-position to base x-position

## Creating Base Images

### Recommended Tools
- **PixelLab**: AI-generated pixel art bases
- **Aseprite**: Manual pixel art creation
- **Photoshop/GIMP**: Digital illustration with downscaling

### PixelLab Prompts

**Stone Age:**
```
Stone Age base structure:
Primitive fortification made of rough stones and wooden logs, 192 pixels tall.
Cave entrance or wooden palisade with animal hide decorations.
Tribal totems and fire pit, earth tone colors (browns, grays).
Side view, pixel art style, transparent background.
```

**Bronze Age:**
```
Bronze Age fortress base:
Ancient stone tower with bronze reinforcements, 192 pixels tall.
Cut stone blocks with bronze shields and banners.
Temple-like architecture, stone gray and bronze colors.
Side view, pixel art style, transparent background.
```

**Future Age:**
```
Future Age bunker base:
High-tech metallic structure with energy shields, 192 pixels tall.
Neon lights, holographic displays, and antenna arrays.
Futuristic sci-fi architecture, metallic silver and neon blue.
Side view, pixel art style, transparent background.
```

## Testing Checklist

- [ ] Base loads at correct size (h-48 = 192px)
- [ ] Image has transparent background
- [ ] Looks good when flipped horizontally (AI side)
- [ ] Doesn't block battlefield visibility
- [ ] Matches era theme
- [ ] Ground alignment looks natural
- [ ] File size optimized (< 100KB)