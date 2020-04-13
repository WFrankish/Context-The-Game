import Consumable from './consumable.js';
import { ItemCategory } from '../item.js';

export default class HealthPotion implements Consumable {
  static itemName = 'Health potion';

  category: ItemCategory.Consumable = ItemCategory.Consumable;
  name: string = HealthPotion.itemName;
  weight: number = 1;
  volume: number = 5;
  value: number = 10;

  consume(person: any): void {}
}
