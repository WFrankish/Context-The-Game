import { inputs } from './inputs.js';
import { Drawable, HudText, Anchor } from './drawing/drawable.js';
import { Vector2 } from '../common/vector2.js';
import * as display from './display.js';

let wasInventoryKeyPressed: boolean = false;
let showInventory: boolean = false;

export function shouldShowInventory(): boolean {
  if (inputs.inventory) {
    if (wasInventoryKeyPressed) {
      // Was pressed last update, still pressed; don't update.
      return showInventory;
    }

    // Inventory key was not pressed last update; toggle whether the inventory is open.
    wasInventoryKeyPressed = true;
    showInventory = !showInventory;
  } else {
    wasInventoryKeyPressed = false;
  }

  return showInventory;
}

/**
 * Draws the inventory drawables into the HUD
 * @param hud Drawable array to add elements to
 */
export function drawInventory(context: CanvasRenderingContext2D, dt: number): void {
  const oldFillStyle = context.fillStyle;

  context.fillStyle = 'white';
  new HudText('INVENTORY', 36, new Vector2(display.width / 2, 10), Anchor.Top).draw(context, dt);

  context.fillStyle = oldFillStyle;
}
