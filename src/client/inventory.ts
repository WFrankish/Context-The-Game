import { Drawable, HudText, Anchor } from './drawing/drawable.js';
import { Vector2 } from '../common/vector2.js';
import * as display from './display.js';
import { Image, openStatic } from './drawing/image.js';
import BodyPart from '../common/character/body_part.js';
import { localPlayer } from './character.js';

const inventoryTileWidth = 32;
const inventoryTileHeight = 32;
const inventoryImages = new Map<string, Image>();

export async function init() {
  const equipmentSquare = await openStatic('inventory_square.png');

  inventoryImages.set('default', equipmentSquare);
}

addEventListener('keypress', (event: KeyboardEvent) => {
  if (event.code === 'KeyI') {
    showInventory = !showInventory;
  }
});

export let showInventory: boolean = false;

/**
 * Draws the inventory drawables into the HUD
 * @param hud Drawable array to add elements to
 */
export function drawInventory(context: CanvasRenderingContext2D, dt: number): void {
  const oldFillStyle = context.fillStyle;

  context.fillStyle = '#633c12dd';
  context.fillRect(0, 0, display.width, display.height);
  context.fillStyle = '#ffffff';
  const text: Drawable[] = [
    new HudText('INVENTORY', 36, new Vector2(display.width / 2, 10), Anchor.Top),
    new HudText('Backpack', 24, new Vector2(display.width / 4, 100), Anchor.Top),
    new HudText('Equipped', 24, new Vector2((display.width * 3) / 4, 100), Anchor.Top),
  ];
  for (const hudText of text) {
    hudText.draw(context, dt);
  }

  // Backpack section

  // Y-coord of the top-most equipment tile
  const equipmentTopY = 140;
  const equipmentMidX = (display.width * 3) / 4;

  const equipmentSquares: Drawable[] = [
    new EquipmentTile(
      new Vector2(equipmentMidX - inventoryTileWidth / 2, equipmentTopY + inventoryTileHeight),
      BodyPart.Head,
      inventoryImages.get('default')!
    ),
  ];

  for (const square of equipmentSquares) {
    square.draw(context, dt);
  }

  context.fillStyle = oldFillStyle;
}

export class EquipmentTile implements Drawable {
  bodyPart: BodyPart;
  defaultImage: Image;
  position: Vector2;

  constructor(pos: Vector2, bodyPart: BodyPart, defaultImage: Image) {
    this.position = pos;
    this.defaultImage = defaultImage;
    this.bodyPart = bodyPart;
  }

  draw(ctx: CanvasRenderingContext2D, dt: number): void {
    if (localPlayer.inventory.equippedArmourByPart.has(this.bodyPart)) {
      // TODO: Draw armour
    } else if (localPlayer.inventory.equippedWeaponsByPart.has(this.bodyPart)) {
      // TODO: Draw weapon
    } else {
      ctx.drawImage(this.defaultImage.get().data, this.position.x, this.position.y);
    }
  }
}
