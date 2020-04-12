import Item, { ItemCategory } from '../item.js';

export function isConsumable(item: Item): item is Consumable {
  return item.category === ItemCategory.Consumable;
}

export default interface Consumable extends Item {
  category: ItemCategory.Consumable;

  consume: (person: any) => void;
}
