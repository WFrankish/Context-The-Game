interface Dimension {
  width: number;
  height: number;
}

export enum ItemCategory {
  Weapon,
  Armour,
  Potion,
}

export default interface Item {
  name: string;
  weight: number;
  size: Dimension;
  value: number;
  category: ItemCategory;
}
