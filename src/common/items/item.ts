export enum ItemCategory {
  Weapon = 'Weapon',
  Armour = 'Armour',
  Consumable = 'Consumable',
}

export default interface Item {
  category: ItemCategory;
  name: string;
  weight: number;
  volume: number;
  value: number;
  imagePath: string;
}
