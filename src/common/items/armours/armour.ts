import Item, { ItemCategory } from "../item";
import BodyPart from "src/common/character/body_part";

export function isArmour(item: Item): item is Armour {
  return item.category === ItemCategory.Armour;
}

export default interface Armour extends Item {
  category: ItemCategory.Armour;

  coverage: Set<BodyPart>;
  physicalArmour: number;
  magicalArmour: number;
}
