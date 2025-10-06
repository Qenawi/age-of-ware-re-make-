// Frame-based animation loader for Slingshot unit
// Maps raw folder names to logical actions used by game logic

function loadFrames(globResult: Record<string, any>): string[] {
  return Object.keys(globResult)
    .sort()
    .map(k => (globResult[k]?.default) || globResult[k]);
}

// Folder mapping (east only currently)
const idleFrames = loadFrames(import.meta.glob('./animations/breathing-idle/east/*.png', { eager: true }));
const walkFrames = loadFrames(import.meta.glob('./animations/walking-6-frames/east/*.png', { eager: true }));
const attackFrames = loadFrames(import.meta.glob('./animations/throw-object/east/*.png', { eager: true }));
const hitFrames = loadFrames(import.meta.glob('./animations/taking-punch/east/*.png', { eager: true }));

export interface SlingshotAnimationSet {
  idle: string[];
  walk: string[];
  attack: string[];
  hit: string[];
}

export const slingshotAnimations: SlingshotAnimationSet = {
  idle: idleFrames,
  walk: walkFrames,
  attack: attackFrames,
  hit: hitFrames,
};

export function getSlingshotFrames(status: 'walking' | 'attacking' | 'idle' | 'hit'): string[] {
  switch (status) {
    case 'attacking': return slingshotAnimations.attack;
    case 'walking': return slingshotAnimations.walk;
    case 'hit': return slingshotAnimations.hit;
    case 'idle':
    default:
      return slingshotAnimations.idle;
  }
}
