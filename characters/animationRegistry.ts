// Registry for frame-based unit animations
// Each entry returns frames for a given logical status

import { getClubmanFrames } from './clup-man/clubmanAnimations';
import { getSlingshotFrames } from './Slingshot/slingshotAnimations';

export type UnitVisualStatus = 'walking' | 'attacking' | 'idle' | 'dead' | 'hit';

type FrameProvider = (status: UnitVisualStatus) => string[];

const registry: Record<string, FrameProvider> = {
  'Clubman': (status) => getClubmanFrames(status === 'dead' ? 'dead' : (status as any)),
  'Slingshot': (status) => getSlingshotFrames(status as any),
};

export function getFramesForUnit(unitName: string, status: UnitVisualStatus): string[] | null {
  const provider = registry[unitName];
  if (!provider) return null;
  return provider(status);
}

// Future: expose a register function if runtime modding is desired
// export function registerUnitFrames(name: string, provider: FrameProvider) {
//   registry[name] = provider;
// }
