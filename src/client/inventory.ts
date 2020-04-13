import { Drawable, HudText, Anchor } from './drawing/drawable.js';
import { Vector2 } from '../common/vector2.js';
import * as display from './display.js';
import { Sprite, openSprites } from './drawing/image.js';
import BodyPart from '../common/character/body_part.js';
import { localPlayer } from './character.js';

const inventoryTileWidth = 32;
const inventoryTileHeight = 32;
const inventoryImages = new Map<BodyPart | string, Sprite>();

export async function init() {
  const inventoryPics = await openSprites('inventory.png', 32, 32);

  inventoryImages.set('default', inventoryPics[0]);
  inventoryImages.set(BodyPart.Torso, inventoryPics[1]);
  inventoryImages.set(BodyPart.Head, inventoryPics[2]);
  inventoryImages.set(BodyPart.LeftArm, inventoryPics[3]);
  inventoryImages.set(BodyPart.RightArm, inventoryPics[4]);
  inventoryImages.set(BodyPart.LeftHand, inventoryPics[5]);
  inventoryImages.set(BodyPart.RightHand, inventoryPics[6]);
  inventoryImages.set(BodyPart.LeftLeg, inventoryPics[7]);
  inventoryImages.set(BodyPart.RightLeg, inventoryPics[8]);
  inventoryImages.set(BodyPart.LeftFoot, inventoryPics[9]);
  inventoryImages.set(BodyPart.RightFoot, inventoryPics[10]);
  inventoryImages.set(BodyPart.Back, inventoryPics[11]);
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
  const equipmentTopY = 120;
  const equipmentMidX = (display.width * 3) / 4;
  const equipmentPaddingAmount = 15;

  const headLocation = new Vector2(equipmentMidX - inventoryTileWidth / 2, equipmentTopY + inventoryTileHeight);
  const torsoLocation = new Vector2(headLocation.x, headLocation.y + inventoryTileHeight + equipmentPaddingAmount);
  const leftArmLocation = new Vector2(
    torsoLocation.x - inventoryTileWidth - equipmentPaddingAmount,
    torsoLocation.y - equipmentPaddingAmount
  );
  const rightArmLocation = new Vector2(
    torsoLocation.x + inventoryTileWidth + equipmentPaddingAmount,
    leftArmLocation.y
  );
  const leftHandLocation = new Vector2(
    leftArmLocation.x,
    leftArmLocation.y + inventoryTileHeight + equipmentPaddingAmount
  );
  const rightHandLocation = new Vector2(
    rightArmLocation.x,
    rightArmLocation.y + inventoryTileHeight + equipmentPaddingAmount
  );
  const leftLegLocation = new Vector2(
    torsoLocation.x - inventoryTileWidth / 2 - equipmentPaddingAmount / 2,
    leftHandLocation.y + inventoryTileHeight + equipmentPaddingAmount / 2
  );
  const rightLegLocation = new Vector2(
    leftLegLocation.x + inventoryTileWidth + equipmentPaddingAmount,
    leftLegLocation.y
  );
  const leftFootLocation = new Vector2(
    leftLegLocation.x,
    leftLegLocation.y + inventoryTileHeight + equipmentPaddingAmount
  );
  const rightFootLocation = new Vector2(
    rightLegLocation.x,
    rightLegLocation.y + inventoryTileHeight + equipmentPaddingAmount
  );

  const equipmentSquares: Drawable[] = [
    new EquipmentTile(headLocation, BodyPart.Head, inventoryImages.get(BodyPart.Head)!),
    new EquipmentTile(torsoLocation, BodyPart.Torso, inventoryImages.get(BodyPart.Torso)!),
    new EquipmentTile(leftArmLocation, BodyPart.LeftArm, inventoryImages.get(BodyPart.LeftArm)!),
    new EquipmentTile(rightArmLocation, BodyPart.RightArm, inventoryImages.get(BodyPart.RightArm)!),
    new EquipmentTile(leftHandLocation, BodyPart.LeftHand, inventoryImages.get(BodyPart.LeftHand)!),
    new EquipmentTile(rightHandLocation, BodyPart.RightHand, inventoryImages.get(BodyPart.RightHand)!),
    new EquipmentTile(leftLegLocation, BodyPart.LeftLeg, inventoryImages.get(BodyPart.LeftLeg)!),
    new EquipmentTile(rightLegLocation, BodyPart.RightLeg, inventoryImages.get(BodyPart.RightLeg)!),
    new EquipmentTile(leftFootLocation, BodyPart.LeftFoot, inventoryImages.get(BodyPart.LeftFoot)!),
    new EquipmentTile(rightFootLocation, BodyPart.RightFoot, inventoryImages.get(BodyPart.RightFoot)!),
  ];

  for (const square of equipmentSquares) {
    square.draw(context, dt);
  }

  context.fillStyle = oldFillStyle;
}

export class EquipmentTile implements Drawable {
  bodyPart: BodyPart;
  backImage: Sprite;
  position: Vector2;

  constructor(pos: Vector2, bodyPart: BodyPart, backImage: Sprite) {
    this.position = pos;
    this.backImage = backImage;
    this.bodyPart = bodyPart;
  }

  draw(ctx: CanvasRenderingContext2D, dt: number): void {
    if (localPlayer.inventory.equippedArmourByPart.has(this.bodyPart)) {
      // TODO: Draw armour
    } else if (localPlayer.inventory.equippedWeaponsByPart.has(this.bodyPart)) {
      // TODO: Draw weapon
    } else {
      const { data, startX, startY, width, height } = this.backImage.get();

      ctx.drawImage(data, startX, startY, width, height, this.position.x, this.position.y, width, height);
    }
  }
}
