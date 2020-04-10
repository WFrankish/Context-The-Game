import Item, { ItemCategory } from "../item";

export enum ArmourType {
  Leg,
  Torso,
  Arm,
  Neck,
}

export default interface Armour extends Item {
  category: ItemCategory.Armour;

  coverage: Set<ArmourType>;
  physicalArmour: number;
  magicalArmour: number;
}
