import Item, { ItemCategory } from "../item";

export function isConsumable(item: Item): item is Consumable {
  return item.category === ItemCategory.Consumable;
}

export default interface Consumable extends Item {
  category: ItemCategory.Consumable;

  consume: (person: any) => void;
}
