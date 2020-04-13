import { ItemCategory } from '../common/items/item.js';
import { Sprite, openSprites } from './drawing/image.js';
import HealthPotion from '../common/items/consumables/health_potion.js';

const itemImageMap: Map<ItemCategory, Map<string, Sprite>> = new Map<ItemCategory, Map<string, Sprite>>();

export async function init(): Promise<void> {
  const itemSprites = await openSprites('items.png', 30, 30);

  const consumables = new Map<string, Sprite>();

  consumables.set(HealthPotion.itemName, itemSprites[0]);

  const armours = new Map<string, Sprite>();
  const weapons = new Map<string, Sprite>();

  itemImageMap.set(ItemCategory.Consumable, consumables);
  itemImageMap.set(ItemCategory.Armour, armours);
  itemImageMap.set(ItemCategory.Weapon, weapons);
}

export default itemImageMap;
