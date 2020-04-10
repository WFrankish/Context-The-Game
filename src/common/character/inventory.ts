import Item, { ItemCategory } from "../items/item";
import Armour, { isArmour } from "../items/armours/armour";
import Weapon, { isWeapon } from "../items/weapons/weapon";
import BodyPart from "./body_part";

interface InventoryConstructorOptions {
  sizeCapacity?: number;
  weightCapacity?: number;
}

export default class Inventory {
  private _contents = new Set<Item>();
  private _equippedWeapons = new Map<BodyPart, Weapon>();
  private _equippedArmour = new Map<BodyPart, Armour>();
  private _sizeCapacity: number;
  private _weightCapacity: number;

  constructor({
    sizeCapacity = 50,
    weightCapacity = 100,
  }: InventoryConstructorOptions) {
    this._sizeCapacity = sizeCapacity;
    this._weightCapacity = weightCapacity;
  }

  get usedSize(): number {
    let size = 0;

    for (const item of this._contents) {
      size += item.size;
    }

    return size;
  }

  get usedWeight(): number {
    let weight = 0;

    for (const item of this._contents) {
      weight += item.weight;
    }

    return weight;
  }

  /**
   * Tries to store the given item, checking size and weight constraints. Returns false if limit reached, true if successfully added
   * @param item Item to store
   */
  store(item: Item): boolean {
    if (this.usedSize + item.size > this._sizeCapacity) {
      return false;
    }

    if (this.usedWeight + item.weight > this._weightCapacity) {
      return false;
    }

    this._contents.add(item);

    return true;
  }

  /**
   * Tries to remove the given item, returns true if successful or false if item doesn't exist
   * @param item Item to remove
   */
  remove(item: Item): boolean {
    return this._contents.delete(item);
  }

  /**
   * Returns all the stored items
   */
  getAll(): Set<Item> {
    return new Set<Item>(this._contents);
  }

  /**
   * Loads all the items of the given category
   * @param category Category to find
   */
  getAllOfCategory(category: ItemCategory): Set<Item> {
    const items = new Set<Item>();

    for (const item of this._contents) {
      if (item.category === category) {
        items.add(item);
      }
    }

    return items;
  }

  /**
   * Tries to equip the item, returning false if item not stored and capacity reached,
   * equipped item cannot be unequipped.
   * @param item Item to equip
   */
  equipItem(item: Armour | Weapon, unequipExisting: boolean = true): boolean {
    if (!this._contents.has(item)) {
      if (!this.store(item)) {
        return false;
      }
    }

    const parts = this._getBodyParts(item);
    const currentlyEquipped = isArmour(item)
      ? this._equippedArmour
      : this._equippedWeapons;

    for (const part of parts) {
      if (currentlyEquipped.has(part)) {
        if (unequipExisting) {
          currentlyEquipped.delete(part);
        } else {
          return false;
        }
      }
    }

    if (isArmour(item)) {
      for (const part of parts) {
        this._equippedArmour.set(part, item);
      }
    } else {
      for (const part of parts) {
        this._equippedWeapons.set(part, item);
      }
    }

    return true;
  }

  unequipItem(item: Armour | Weapon): void {
    const parts = this._getBodyParts(item);
    const mapToRemoveFrom = isArmour(item)
      ? this._equippedArmour
      : this._equippedWeapons;

    for (const part of parts) {
      mapToRemoveFrom.delete(part);
    }
  }

  private _getBodyParts(item: Armour | Weapon): Set<BodyPart> {
    if (isArmour(item)) {
      return item.coverage;
    } else {
      return item.equippedIn;
    }
  }
}
