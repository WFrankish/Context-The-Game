export const clamp = (n: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, n));
};
