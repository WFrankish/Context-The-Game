export const clamp = (n: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, n));
};

export function shuffle<T>(a: T[]) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
}
