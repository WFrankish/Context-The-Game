import { Seconds } from 'src/common/time';

export interface Updatable {
  update(dt: Seconds): void;
}
