import Item, { ItemCategory } from "../item";

export default interface Weapon extends Item {
  category: ItemCategory.Weapon;

  damage: number;
  attackTime: number;
}
