import { Seconds } from "../common/time.js";
import { Vector2 } from "../common/vector2.js";
import { Inputs, inputs } from "./inputs.js";

import * as display from "./display.js";
import { Updatable } from "./updatable.js";
import { tileWidth, tileHeight } from "../common/constants.js";

export class CameraControl implements Updatable {
  static image = new Image();
  update(dt: Seconds) {
    let move = new Vector2(inputs.camRight - inputs.camLeft, (inputs.camDown - inputs.camUp) / (tileWidth / tileHeight));
    if (move.dotProduct(move) > 0) {
      move = move.normalized();
    } else {
    }
    display.camera.position = display.camera.position.add(move.multiply(this.moveSpeed * dt));
  }
  inputs = new Inputs();
  moveSpeed = 15;
}