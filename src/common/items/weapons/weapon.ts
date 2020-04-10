import Item, { ItemCategory } from "../item";
import BodyPart from "src/common/character/body_part";

export function isWeapon(item: Item): item is Weapon {
  return item.category === ItemCategory.Weapon;
}

export default interface Weapon extends Item {
  category: ItemCategory.Weapon;

  equippedIn: Set<BodyPart>;
  damage: number;
  attackTime: number;
}
