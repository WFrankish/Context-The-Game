import Armour, {isArmour} from '../items/armours/armour';
import Item, {ItemCategory} from '../items/item';
import Weapon from '../items/weapons/weapon';

import BodyPart from './body_part';

interface InventoryConstructorOptions {
  maxVolume?: number;
  maxWeight?: number;
}

export default class Inventory {
  private _backpack = new Set<Item>();
  private _equippedWeapons = new Map<BodyPart, Weapon>();
  private _equippedArmour = new Map<BodyPart, Armour>();

  /**
   * Maximum volume which can be stored in the backpack. Equipped weapons and
   * armour do **not** count towards this limit
   */
  private _maxVolume: number;

  /**
   * Maximum weight which can be carried. Counts the backpack and all the
   * equipped weapons and armour
   */
  private _maxWeight: number;

  constructor({
    maxVolume = 50,
    maxWeight = 100,
  }: InventoryConstructorOptions) {
    this._maxVolume = maxVolume;
    this._maxWeight = maxWeight;
  }

  get usedVolume(): number {
    let volume = 0;

    for (const item of this._backpack) {
      volume += item.volume;
    }

    return volume;
  }

  get usedWeight(): number {
    let weight = 0;

    for (const item of this._backpack) {
      weight += item.weight;
    }

    // Weapons and armour may be in multiple slots; only count their weight once.
    const seenWeapons = new Set<Weapon>();
    
    for (const weapon of this._equippedWeapons.values()) {
      if (!seenWeapons.has(weapon)) {
        weight += weapon.weight;
        seenWeapons.add(weapon);
      }
    }

    const seenArmour = new Set<Armour>();

    for (const armour of this._equippedArmour.values()) {
      if (!seenArmour.has(armour)) {
        weight += armour.weight;
        seenArmour.add(armour);
      }
    }

    return weight;
  }

  /**
   * Tries to store the given item, checking volume and weight constraints.
   * Returns false if limit reached, true if successfully added
   * @param item Item to store
   */
  store(item: Item): boolean {
    if (this.usedVolume + item.volume > this._maxVolume) {
      return false;
    }

    if (this.usedWeight + item.weight > this._maxWeight) {
      return false;
    }

    this._backpack.add(item);

    return true;
  }

  /**
   * Tries to remove the given item, returns true if successful or false if item
   * doesn't exist
   * @param item Item to remove
   */
  remove(item: Item): boolean {
    return this._backpack.delete(item);
  }

  /**
   * Returns all the stored items
   */
  getAll(): Set<Item> {
    return new Set<Item>(this._backpack);
  }

  /**
   * Loads all the items of the given category
   * @param category Category to find
   */
  getAllOfCategory(category: ItemCategory): Set<Item> {
    const items = new Set<Item>();

    for (const item of this._backpack) {
      if (item.category === category) {
        items.add(item);
      }
    }

    return items;
  }

  getEquippedWeapons(): Map<BodyPart, Weapon> {
    return new Map<BodyPart, Weapon>(this._equippedWeapons);
  }

  getEquippedArmour(): Map<BodyPart, Armour> {
    return new Map<BodyPart, Armour>(this._equippedArmour);
  }

  /**
   * Tries to equip the item. Equipped items take no volume; this can cause
   * equip to fail for these reasons:
   *   - Item not in inventory, would go over max weight
   *   - Item in inventory, would go over max volume if currently equipped items
   * removed
   * @param item Item to equip
   */
  equipItem(item: Armour|Weapon, unequipExisting: boolean = true): boolean {
    if (!this._backpack.has(item)) {
      // Not in inventory atm, check the weight limit.
      if (this.usedWeight + item.weight > this._maxWeight) {
        return false;
      }
    }

    // Get all the equipped items in all the body parts this new item wants to
    // use
    const parts = this._getBodyParts(item);
    const currentlyEquipped =
        isArmour(item) ? this._equippedArmour : this._equippedWeapons;
    const equippedItems = new Set<Armour|Weapon>();

    for (const part of parts) {
      const equippedItem = currentlyEquipped.get(part);
      if (equippedItem) {
        equippedItems.add(equippedItem);
      }
    }

    // Check that we won't go over the maxVolume when putting our old
    // armour/weapons away (remembering that the new armour/weapon won't count
    // towards the volume limit)
    let targetVolume = this.usedVolume;

    for (const item of equippedItems) {
      targetVolume += item.volume;
    }

    if (this._backpack.has(item)) {
      targetVolume -= item.volume;
    }

    if (targetVolume > this._maxVolume) {
      return false;
    }

    // Put all currently equipped items which need to be removed into the
    // backpack
    for (const item of equippedItems) {
      this._backpack.add(item);
    }

    // Put this item in all the correct places (which will remove the old items
    // from the equipped slots)
    if (isArmour(item)) {
      for (const part of parts) {
        this._equippedArmour.set(part, item);
      }
    } else {
      for (const part of parts) {
        this._equippedWeapons.set(part, item);
      }
    }

    // Don't store the newly-equipped item in the backpack; we're using it!
    this._backpack.delete(item);

    return true;
  }

  unequipItem(item: Armour|Weapon): void {
    const parts = this._getBodyParts(item);
    const mapToRemoveFrom =
        isArmour(item) ? this._equippedArmour : this._equippedWeapons;

    for (const part of parts) {
      mapToRemoveFrom.delete(part);
    }
  }

  private _getBodyParts(item: Armour|Weapon): Set<BodyPart> {
    if (isArmour(item)) {
      return item.coverage;
    } else {
      return item.equippedIn;
    }
  }
}
