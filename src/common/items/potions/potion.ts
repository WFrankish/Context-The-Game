import Item, { ItemCategory } from "../item";

export default interface Potion extends Item {
  category: ItemCategory.Potion;

  consume: (person: any) => void;
}
