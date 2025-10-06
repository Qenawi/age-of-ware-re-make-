<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1prmiGdHcD4vkyPWKV9e6qKPVaB7chsRz

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Clubman Frame-Based Animations

The Stone Age Clubman now uses frame-by-frame PNG animations instead of a single SVG sprite. Frames live under `characters/clup-man/animations/` organized by action and direction (currently only `east`). A lightweight loader (`clubmanAnimations.ts`) uses `import.meta.glob` to eagerly import and order frames (sorted by filename).

Runtime selection logic in `components/Unit.tsx` detects `unit.stats.name === 'Clubman'` and cycles through:

- `breathing-idle` (mapped to idle – currently unused because logic has only walking/attacking)
- `walk` for movement
- `cross-punch` for attacks
- `falling-back-death` reserved for future death handling

If you add more directions, mirror logic can be extended; right now east images are flipped for AI units using CSS `scaleX(-1)`.

### Adding Another Frame-Based Character
1. Create a folder under `characters/<new-character>/animations/<action>/<direction>/frame_###.png`.
2. Implement a `<name>Animations.ts` similar to `clubmanAnimations.ts` exporting ordered frame arrays.
3. In `Unit.tsx`, extend the detection logic (e.g., by adding a registry mapping unit name to a frame provider function) to animate the new unit.
4. Provide fallback `walkImage` / `attackImage` in `constants.ts` so the game still loads even if frames fail.

### Notes
- Frame timing can be tuned in `Unit.tsx` (`attackSpeedFactor`).
- Consider deriving timing from `unit.stats.attackSpeed` for consistency across units.
- Death animation hook can be added when unit status includes a `dead` state.

## Slingshot Frame-Based Animations

Slingshot sprites live under `characters/Slingshot/animations/` and include:

- `breathing-idle` -> idle
- `walking-6-frames` -> walk
- `throw-object` -> attack
- `taking-punch` -> hit (currently unused, could flash when damaged)

`slingshotAnimations.ts` loads and maps these to logical actions. The generic registry now provides frames automatically to the `Unit` component.

## Animation Registry

`characters/animationRegistry.ts` centralizes frame providers. To add a new frame-animated unit:

1. Create your `<UnitName>Animations.ts` exporting a function that returns frames for a given status.
2. Add it to the `registry` object with the key exactly matching `unit.stats.name` in `constants.ts`.
3. Optionally extend statuses (`idle`, `dead`, `hit`). The game currently only sets `walking` / `attacking`.

This abstraction removed hardcoded Clubman logic and supports any number of animated units.

## Ground Alignment (PLAYFIELD_GROUND_OFFSET)

Units and bases share a common ground line controlled by `GAME_CONFIG.PLAYFIELD_GROUND_OFFSET` (pixels from the bottom of the game area). If you adjust UI height or asset sizes and the characters float or sink, tweak this single value in `constants.ts` instead of editing multiple components.

Referenced in:
- `components/Unit.tsx` (unit container `bottom` style)
- `App.tsx` (base images; a small negative adjustment is applied to visually embed bases into the ground)

To shift everything up by 10px, just increase the constant by 10.

## Background Music

The game plays a looping soundtrack (`Glorious Morning.mp3`) from `public/assets/music/` as background music.

To change the music:
1. Replace `public/assets/music/Glorious Morning.mp3` with your own MP3 file (keep the same filename or update the `src` in `App.tsx`).
2. The music autoplays and loops by default. To disable, remove or comment out the `<audio>` element in `App.tsx`.

If you want to add a mute button or volume control, you can expose the audio element and add UI controls as needed.
