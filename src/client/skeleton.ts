import { Seconds } from '../common/time.js';
import {Character} from './character.js';
import { Vector2 } from '../common/vector2.js';

export class Skeleton extends Character {
  static image = new Image();

  private totalTime = 0;
  private lastUpdate = -1;

  constructor(position: Vector2) {
    // TODO: This needs a unique ID per skeleton to work properly.
    super('skeleton');
    this.totalTime += Math.random();
    this.position = position;
  }

  get image(){
    return Skeleton.image;
  }

  update(dt: Seconds){
    super.update(dt);

    this.totalTime += dt;

    if (this.totalTime - this.lastUpdate > 2) {
      this.lastUpdate = this.totalTime;
      this.inputs.left = Math.random() > 0.5 ? 1 : 0;
      this.inputs.up = Math.random() > 0.5 ? 1 : 0;
      this.inputs.down = Math.random() > 0.5 ? 1 : 0;
      this.inputs.right = Math.random() > 0.5 ? 1 : 0;
      this.inputs.primary = Math.random() > 0.2 ? this.inputs.primary : 1 - this.inputs.primary;
      this.inputs.secondary = Math.random() > 0.2 ? this.inputs.secondary : 1 - this.inputs.secondary
      this.processInputs();
    }
  }
}
Skeleton.image.src = '/assets/mrskeltal.png';
