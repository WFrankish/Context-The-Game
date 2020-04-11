export type Seconds = number;
export type Milliseconds = number;
export type Timestamp = Milliseconds;

export function delay(x: Milliseconds) {
  return new Promise((resolve, reject) => setTimeout(resolve, x));
}

export function time(t: Timestamp) {
  return new Promise((resolve, reject) => setTimeout(resolve, t - Date.now()));
}
