const maxSamples = 10;
const samplePeriod: Milliseconds = 100;
const counters: Map<string, Counter> = new Map;
let awaitingSample: Set<Counter> = new Set;

export type Milliseconds = number;
export type Timestamp = Milliseconds;

function time(t: Timestamp): Promise<void> {
  return new Promise((resolve, reject) => setTimeout(resolve, t - Date.now()));
}

class Sample {
  constructor(time: Timestamp, value: number) {
    this.time = time;
    this.value = value;
  }
  time: Timestamp;
  value: number;
}

class Counter {
  currentValue = 0;
  samples: Sample[] = [];
};

async function sampleLoop() {
  let nextSample = Date.now();
  while (true) {
    await time(nextSample);
    nextSample = Date.now() + samplePeriod;
    const toSample = awaitingSample;
    awaitingSample = new Set;
    for (const counter of toSample) {
      const sample = new Sample(Date.now(), counter.currentValue);
      if (counter.samples.length >= maxSamples) {
        // Discard every other element. This gives us exponentially less
        // sampling data the further back we look.
        let j = 0;
        for (let i = 1, n = counter.samples.length; i < n; i += 2, j++) {
          counter.samples[j] = counter.samples[i];
        }
        counter.samples.splice(j);
      }
      counter.samples.push(sample);
    }
  }
}
sampleLoop();

export function count(id: string, amount: number) {
  if (!counters.has(id)) {
    counters.set(id, new Counter);
  }
  const counter = counters.get(id)!;
  counter.currentValue += amount;
  awaitingSample.add(counter);
}

export function rate(
    id: string, windowSize: Milliseconds = maxSamples * samplePeriod): number {
  if (!counters.has(id)) {
    console.warn('Can\'t give rate for missing metric ' + id);
    return 0;
  }
  const counter = counters.get(id)!;
  if (counter.samples.length == 0) {
    console.warn('Can\'t give rate for unsampled metric ' + id);
    return 0;
  }
  const now = Date.now();
  const start = now - windowSize;
  const current = counter.currentValue;
  // Find the sample which is closest to the window start.
  let i = 0, j = counter.samples.length;
  while (j - i > 1) {
    const mid = i + Math.floor((j - i) / 2);
    if (counter.samples[mid].time <= start) {
      i = mid;
    } else {
      j = mid;
    }
  }
  const deltaValue = current - counter.samples[i].value;
  const deltaTime = (now - counter.samples[i].time) / 1000;
  if (deltaTime <= 0) {
    console.warn('Can\'t give rate for malformed metric ' + id);
    return 0;
  }
  return deltaValue / deltaTime;
}

export function summary(filter: RegExp): void {
  const results = [];
  for (const [name, counter] of counters) {
    if (!name.match(filter)) continue;
    const value = counter.currentValue;
    const changePerSecond = rate(name, 30000);
    results.push({name, value, changePerSecond});
  }
  console.table(results);
}
