import BodyPart from '../../character/body_part.js';

import Item, { ItemCategory } from '../item.js';

export function isArmour(item: Item): item is Armour {
  return item.category === ItemCategory.Armour;
}

export default interface Armour extends Item {
  category: ItemCategory.Armour;

  coverage: Set<BodyPart>;
  physicalArmour: number;
  magicalArmour: number;
  carryVolumeIncrease?: number;
}
