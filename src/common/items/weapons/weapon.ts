import BodyPart from '../../character/body_part.js';

import Item, { ItemCategory } from '../item.js';

export function isWeapon(item: Item): item is Weapon {
  return item.category === ItemCategory.Weapon;
}

export default interface Weapon extends Item {
  category: ItemCategory.Weapon;

  equippedIn: Set<BodyPart>;
  damage: number;
  attackTime: number;
}
