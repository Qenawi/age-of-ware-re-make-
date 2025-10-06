# Battlefield Background Specifications

## Overview
Custom battlefield maps serve as backgrounds for each age in the game. They provide visual context and atmosphere while ensuring gameplay clarity.

## Technical Requirements

### Image Dimensions
- **Width**: 1200px
- **Height**: 600px
- **Format**: PNG (recommended for quality) or JPG
- **File Location**: `public/assets/backgrounds/`

### Required Files
1. `stone-age-battlefield.png` - Stone Age theme
2. `bronze-age-battlefield.png` - Bronze Age theme
3. `future-age-battlefield.png` - Future Age theme

## Design Guidelines

### Layout Zones (Horizontal)
```
┌─────────────────────────────────────────────────────────────┐
│  Player Base        Combat Zone         AI Base             │
│  (60-200px)         (200-1000px)        (1000-1140px)       │
└─────────────────────────────────────────────────────────────┘
```

### Vertical Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Sky/Background Layer (0-300px)                             │
│  - Atmosphere, clouds, sky elements                         │
├─────────────────────────────────────────────────────────────┤
│  Middle Layer (300-480px)                                   │
│  - Distant mountains, buildings, horizon                    │
├─────────────────────────────────────────────────────────────┤
│  Ground/Battlefield (480-600px)                             │
│  - Main fighting surface where units walk                   │
│  - Should be relatively flat and clear                      │
└─────────────────────────────────────────────────────────────┘
```

## Theme-Specific Guidelines

### Stone Age Battlefield
**Setting**: Prehistoric wilderness
- **Sky**: Dawn/dusk colors (orange, purple hues)
- **Background**: Rocky cliffs, caves, primitive forest
- **Ground**: Dirt path, grass, scattered stones
- **Details**: Cave paintings on rocks, bone piles, primitive totems
- **Color Palette**: Earth tones (browns, greens, grays)

### Bronze Age Battlefield
**Setting**: Ancient civilization
- **Sky**: Clear day or stormy atmosphere
- **Background**: Stone fortifications, ancient temples, settlements
- **Ground**: Cobblestone path, sand, weathered terrain
- **Details**: Banners, pillars, bronze decorations
- **Color Palette**: Sandy tones, bronze, stone grays, deep blues

### Future Age Battlefield
**Setting**: Sci-fi warzone
- **Sky**: Neon-lit skyline, holographic displays, flying vehicles
- **Background**: Futuristic cityscape, neon buildings, energy shields
- **Ground**: Metallic platform, holographic grid, tech panels
- **Details**: Holograms, energy barriers, digital effects
- **Color Palette**: Neon blues, cyans, purples, metallic silvers

## Best Practices

### Visual Clarity
- Keep the bottom 120px relatively clear for unit visibility
- Avoid busy patterns in combat zones (200-1000px horizontal)
- Use subtle gradients rather than harsh lines
- Ensure bases (positioned at x=60 and x=1080) stand out

### Composition
- Create visual flow from left (player) to right (AI)
- Add subtle asymmetry to indicate opposing sides
- Use atmospheric perspective (distant elements lighter/blurred)
- Include depth through layering

### Performance
- Optimize file size (recommended < 500KB per image)
- Use compression without losing quality
- Test loading performance in browser

## Integration Notes

The backgrounds are automatically applied based on the current age:
- Changed via `constants.ts` → `AGES[x].background`
- Rendered in `App.tsx` via inline style `backgroundImage`
- Updates dynamically when player/AI evolves to new age

## Fallback
If a background image fails to load, the game will show:
- Black background (defined in App.tsx outer container)
- Bases and units will still render correctly
- Consider adding placeholder backgrounds for development

## Testing Checklist
- [ ] Image loads at correct resolution (1200x600)
- [ ] Units are clearly visible against background
- [ ] Bases don't blend into background
- [ ] Performance is acceptable (check browser dev tools)
- [ ] Background fits the age theme
- [ ] Combat zone (center) is not too busy
- [ ] File size is optimized