export const clamp = (value: number, max: number, min: number): number =>
   Math.min(Math.max(min, value), max);
export const lerp = (start: number, end: number, time = 0.05): number =>
   start * (1 - time) + end * time;
