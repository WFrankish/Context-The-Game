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
  private _equippedWeapons = new Set<Weapon>();
  private _equippedWeaponsByPart = new Map<BodyPart, Weapon>();
  private _equippedArmour = new Set<Armour>();
  private _equippedArmourByPart = new Map<BodyPart, Armour>();


  private _baseCarryVolume: number;
  private _carryVolumeBonus: number;

  /**
   * Maximum volume which can be stored in the backpack. Equipped weapons and
   * armour do **not** count towards this limit
   */
  private _maxVolume: number;

  private _usedVolume: number;

  private _baseCarryWeight: number;
  private _carryWeightBonus: number;

  /**
   * Maximum weight which can be carried. Counts the backpack and all the
   * equipped weapons and armour
   */
  private _maxWeight: number;

  private _usedWeight: number;

  constructor({
    maxVolume = 50,
    maxWeight = 100,
  }: InventoryConstructorOptions) {
    this._baseCarryVolume = maxVolume;
    this._carryVolumeBonus = 0;
    this._maxVolume = maxVolume;
    this._usedVolume = 0;

    this._baseCarryWeight = maxWeight;
    this._carryWeightBonus = 0;
    this._maxWeight = maxWeight;
    this._usedWeight = 0;
  }

  get equippedArmour(): Set<Armour> {
    return new Set<Armour>(this._equippedArmour);
  }

  get equippedArmourByPart(): Map<BodyPart, Armour> {
    return new Map<BodyPart, Armour>(this._equippedArmourByPart);
  }

  get equippedWeapons(): Set<Weapon> {
    return new Set<Weapon>(this._equippedWeapons);
  }

  get equippedWeaponsByPart(): Map<BodyPart, Weapon> {
    return new Map<BodyPart, Weapon>(this._equippedWeaponsByPart);
  }

  get usedVolume(): number {
    return this._usedVolume;
  }

  get usedWeight(): number {
    return this._usedWeight;
  }

  get maxWeight(): number {
    return this._maxWeight;
  }

  /**
   * Tries to store the given item, checking volume and weight constraints.
   * Returns false if limit reached, item already in backpack, item is equipped.
   * Returns true if successfully added
   * @param item Item to store
   */
  store(item: Item): boolean {
    if (this._usedVolume + item.volume > this._maxVolume) {
      return false;
    }

    if (this._usedWeight + item.weight > this._maxWeight) {
      return false;
    }

    if (!this._backpack.has(item)) {
      this._usedVolume += item.volume;
      this._usedWeight += item.weight;
      this._backpack.add(item);
      return true;
    }

    return false;
  }

  /**
   * Tries to remove the given item, returns true if successful or false if item
   * doesn't exist
   * @param item Item to remove
   */
  remove(item: Item): boolean {
    const removed = this._backpack.delete(item);

    if (removed) {
      this._usedVolume -= item.volume;
      this._usedWeight -= item.weight;
    }

    return removed;
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
      if (this._usedWeight + item.weight > this._maxWeight) {
        return false;
      }
    }

    // Get all the equipped items in all the body parts this new item wants to
    // use
    const parts = this._getBodyParts(item);
    const currentlyEquipped = isArmour(item) ? this._equippedArmourByPart :
                                               this._equippedWeaponsByPart;
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
    let targetVolume = this._usedVolume;

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
        this._equippedArmourByPart.set(part, item);
      }
    } else {
      for (const part of parts) {
        this._equippedWeaponsByPart.set(part, item);
      }
    }

    // Don't store the newly-equipped item in the backpack; we're using it!
    this._backpack.delete(item);

    return true;
  }

  unequipItem(item: Armour|Weapon): void {
    const parts = this._getBodyParts(item);
    const mapToRemoveFrom = isArmour(item) ? this._equippedArmourByPart :
                                             this._equippedWeaponsByPart;

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
