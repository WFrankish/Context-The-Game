import { Drawable, HudText, Anchor } from './drawing/drawable.js';
import { Vector2 } from '../common/vector2.js';
import * as display from './display.js';
import { Sprite, openSprites } from './drawing/image.js';
import BodyPart from '../common/character/body_part.js';
import { localPlayer } from './character.js';
import Item from '../common/items/item.js';
import ItemImages from './items.js';

const tileWidth = 32;
const tileHeight = 32;
const sprites = new Map<BodyPart | string, Sprite>();

export async function init() {
  const inventoryPics = await openSprites('inventory.png', tileWidth - 2, tileHeight - 2);

  sprites.set('default', inventoryPics[0]);
  sprites.set(BodyPart.Torso, inventoryPics[1]);
  sprites.set(BodyPart.Head, inventoryPics[2]);
  sprites.set(BodyPart.LeftArm, inventoryPics[3]);
  sprites.set(BodyPart.RightArm, inventoryPics[4]);
  sprites.set(BodyPart.LeftHand, inventoryPics[5]);
  sprites.set(BodyPart.RightHand, inventoryPics[6]);
  sprites.set(BodyPart.LeftLeg, inventoryPics[7]);
  sprites.set(BodyPart.RightLeg, inventoryPics[8]);
  sprites.set(BodyPart.LeftFoot, inventoryPics[9]);
  sprites.set(BodyPart.RightFoot, inventoryPics[10]);
  sprites.set(BodyPart.Back, inventoryPics[11]);
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

  const minYCoordOfSquares = 120;
  const padding = 10;

  // Total width of equipped section - 3 tiles wide (torso & arms), 4 sets of padding (edges and between tiles)
  const equippedSectionWidth = tileWidth * 3 + padding * 4;
  const backpackSectionWidth = display.width - equippedSectionWidth;

  // Backpack section
  const numSquares = localPlayer.inventory.maxVolume;

  const availableWidth = backpackSectionWidth - padding;
  const numSquaresPerRow = Math.floor(availableWidth / (tileWidth + padding));
  const backpackSidePadding = (backpackSectionWidth - (numSquaresPerRow * (tileWidth + padding) - padding)) / 2;

  const numRows = Math.ceil(numSquares / numSquaresPerRow);

  const backpackSquares: Drawable[] = [];
  const topLeftX = backpackSidePadding;
  const topLeftY = minYCoordOfSquares + tileHeight;
  const backpack = localPlayer.inventory.getAllStored();
  const backpackIterator = backpack[Symbol.iterator]();
  let hasMoreItems = backpack.size > 0;
  let numIterationsDrawn = 0;
  let storedItem: Item | undefined;

  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numSquaresPerRow; j++) {
      let isDisabled = false;

      if (storedItem && numIterationsDrawn < storedItem.volume) {
        isDisabled = true;
        numIterationsDrawn++;
      } else if (hasMoreItems) {
        const next = backpackIterator.next();
        storedItem = next.value;
        hasMoreItems = !next.done;
        numIterationsDrawn = 1;
      }

      backpackSquares.push(
        new EquipmentTile(
          new Vector2(topLeftX + j * (tileWidth + padding), topLeftY + i * (tileHeight + padding)),
          sprites.get('default')!,
          undefined,
          storedItem,
          isDisabled
        )
      );
    }
  }

  for (const square of backpackSquares) {
    square.draw(context, dt);
  }

  // Y-coord of the top-most equipment tile
  const equipmentTopY = minYCoordOfSquares;
  const equipmentMidX = backpackSectionWidth + equippedSectionWidth / 2;

  const headLocation = new Vector2(equipmentMidX - tileWidth / 2, equipmentTopY + tileHeight);
  const torsoLocation = new Vector2(headLocation.x, headLocation.y + tileHeight + padding);
  const leftArmLocation = new Vector2(torsoLocation.x - tileWidth - padding, torsoLocation.y - padding);
  const rightArmLocation = new Vector2(torsoLocation.x + tileWidth + padding, leftArmLocation.y);
  const leftHandLocation = new Vector2(leftArmLocation.x, leftArmLocation.y + tileHeight + padding);
  const rightHandLocation = new Vector2(rightArmLocation.x, rightArmLocation.y + tileHeight + padding);
  const leftLegLocation = new Vector2(
    torsoLocation.x - tileWidth / 2 - padding / 2,
    leftHandLocation.y + tileHeight + padding / 2
  );
  const rightLegLocation = new Vector2(leftLegLocation.x + tileWidth + padding, leftLegLocation.y);
  const leftFootLocation = new Vector2(leftLegLocation.x, leftLegLocation.y + tileHeight + padding);
  const rightFootLocation = new Vector2(rightLegLocation.x, rightLegLocation.y + tileHeight + padding);

  const equipmentSquares: Drawable[] = [
    new EquipmentTile(headLocation, sprites.get(BodyPart.Head)!, BodyPart.Head),
    new EquipmentTile(torsoLocation, sprites.get(BodyPart.Torso)!, BodyPart.Torso),
    new EquipmentTile(leftArmLocation, sprites.get(BodyPart.LeftArm)!, BodyPart.LeftArm),
    new EquipmentTile(rightArmLocation, sprites.get(BodyPart.RightArm)!, BodyPart.RightArm),
    new EquipmentTile(leftHandLocation, sprites.get(BodyPart.LeftHand)!, BodyPart.LeftHand),
    new EquipmentTile(rightHandLocation, sprites.get(BodyPart.RightHand)!, BodyPart.RightHand),
    new EquipmentTile(leftLegLocation, sprites.get(BodyPart.LeftLeg)!, BodyPart.LeftLeg),
    new EquipmentTile(rightLegLocation, sprites.get(BodyPart.RightLeg)!, BodyPart.RightLeg),
    new EquipmentTile(leftFootLocation, sprites.get(BodyPart.LeftFoot)!, BodyPart.LeftFoot),
    new EquipmentTile(rightFootLocation, sprites.get(BodyPart.RightFoot)!, BodyPart.RightFoot),
  ];

  for (const square of equipmentSquares) {
    square.draw(context, dt);
  }

  context.fillStyle = oldFillStyle;

  const text: Drawable[] = [
    new HudText('INVENTORY', 36, new Vector2(display.width / 2, 10), Anchor.Top),
    new HudText('Backpack', 24, new Vector2(backpackSectionWidth / 2, 100), Anchor.Top),
    new HudText('Equipped', 24, new Vector2(backpackSectionWidth + equippedSectionWidth / 2, 100), Anchor.Top),
  ];
  for (const hudText of text) {
    hudText.draw(context, dt);
  }
}

export class EquipmentTile implements Drawable {
  item?: Item;
  bodyPart?: BodyPart;
  backImage: Sprite;
  position: Vector2;
  disabled: boolean;

  constructor(pos: Vector2, backImage: Sprite, bodyPart?: BodyPart, item?: Item, disabled: boolean = false) {
    this.position = pos;
    this.backImage = backImage;
    this.bodyPart = bodyPart;
    this.item = item;
    this.disabled = disabled;
  }

  draw(ctx: CanvasRenderingContext2D, dt: number): void {
    const { data, startX, startY, width, height } = this.backImage.get();

    ctx.drawImage(data, startX, startY, width, height, this.position.x, this.position.y, width, height);

    if (this.bodyPart) {
      if (localPlayer.inventory.equippedArmourByPart.has(this.bodyPart)) {
        // TODO: Draw armour
      } else if (localPlayer.inventory.equippedWeaponsByPart.has(this.bodyPart)) {
        // TODO: Draw weapon
      }
    } else if (this.item) {
      const img = ItemImages.get(this.item.category)?.get(this.item.name);

      if (img) {
        const { data, startX, startY, width, height } = img.get();
        ctx.drawImage(data, startX, startY, width, height, this.position.x, this.position.y, width, height);
      }
    }

    if (this.disabled) {
      const oldFill = ctx.fillStyle;
      ctx.fillStyle = '#77777777';
      ctx.fillRect(this.position.x, this.position.y, width, height);
      ctx.fillStyle = oldFill;
    }
  }
}
