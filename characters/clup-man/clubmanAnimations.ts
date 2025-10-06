// Frame-based animation loader for Clubman
// Loads frames via Vite's import.meta.glob and exports ordered arrays

function loadFrames(globResult: Record<string, any>): string[] {
  return Object.keys(globResult)
    .sort() // filenames like frame_000.png ... ensure correct order
    .map(k => {
      const mod = globResult[k];
      return (mod && mod.default) || mod; // eager default export
    });
}

// Eagerly load all needed animation frame sequences (east direction only for now)
const walkFrames = loadFrames(import.meta.glob('./animations/walk/east/*.png', { eager: true }));
const attackFrames = loadFrames(import.meta.glob('./animations/cross-punch/east/*.png', { eager: true }));
const idleFrames = loadFrames(import.meta.glob('./animations/breathing-idle/east/*.png', { eager: true }));
const deathFrames = loadFrames(import.meta.glob('./animations/falling-back-death/east/*.png', { eager: true }));

export interface AnimationSet {
  idle: string[];
  walk: string[];
  attack: string[];
  death: string[];
}

export const clubmanAnimations: AnimationSet = {
  idle: idleFrames,
  walk: walkFrames,
  attack: attackFrames,
  death: deathFrames,
};

// Utility to get frames based on logical status
export function getClubmanFrames(status: 'walking' | 'attacking' | 'dead' | 'idle'): string[] {
  switch (status) {
    case 'attacking':
      return clubmanAnimations.attack;
    case 'walking':
      return clubmanAnimations.walk;
    case 'dead':
      return clubmanAnimations.death;
    case 'idle':
    default:
      return clubmanAnimations.idle;
  }
}
