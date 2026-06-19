export interface Particle {
  id: string;
  x: number; // percentage across screen 0-100
  size: number; // diameter in pixels (medium size)
  duration: number; // seconds to transition
  delay: number; // start delay
  swayAmount: number; // horizontal sway distance (in pixels or %)
  rotateSpeed: number; // degrees of rotation
  color?: string; // CSS color or hex (specifically for balloons)
  shapeVariant?: number; // visual variation
}

export type EffectType = 'none' | 'snowflakes' | 'balloons';

export interface PresetConfig {
  spawnInterval: number; // ms between particle spawns
  sizeMin: number;
  sizeMax: number;
  durationMin: number;
  durationMax: number;
}
