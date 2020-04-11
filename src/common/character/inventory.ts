import Armour, { isArmour } from '../items/armours/armour';
import Item, { ItemCategory } from '../items/item';
import Weapon, { isWeapon } from '../items/weapons/weapon';

import BodyPart from './body_part';

interface InventoryConstructorOptions {
  volume?: number;
  weight?: number;
}

export default class Inventory {
  private _backpack = new Set<Item>();
  private _equippedWeapons = new Set<Weapon>();
  private _equippedWeaponsByPart = new Map<BodyPart, Weapon>();
  private _equippedArmour = new Set<Armour>();
  private _equippedArmourByPart = new Map<BodyPart, Armour>();

  /**
   * Maximum volume which can be stored in the backpack. Equipped weapons and
   * armour do **not** count towards this limit
   */
  private _baseVolume: number;
  private _bonusVolumeFromSkill: number = 0;
  private _bonusVolumeFromEquipment: number = 0;
  private _maxVolume: number;
  private _usedVolume = 0;

  /**
   * Maximum weight which can be carried. Counts the backpack and all the
   * equipped weapons and armour
   */
  private _baseWeight: number;
  private _bonusWeightFromSkill: number = 0;
  private _maxWeight: number;
  private _usedWeight = 0;

  constructor({ volume = 50, weight = 100 }: InventoryConstructorOptions) {
    this._baseVolume = volume;
    this._maxVolume = volume;
    this._baseWeight = weight;
    this._maxWeight = weight;
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
   * Modifies the bonus to volume capacity provided by character skill. Will return false (and not modify bonus)
   * if it would make the character over-volumed.
   * @param amount Amount to modify volumeSkillBonus by
   */
  addToVolumeSkillBonus(amount: number): boolean {
    if (this._baseVolume + this._bonusVolumeFromEquipment + this._bonusVolumeFromSkill + amount < this._usedVolume) {
      return false;
    }

    this._bonusVolumeFromSkill += amount;

    return true;
  }

  /**
   * Modifies the bonus to weight capacity provided by character skill. Will return false (and not modify bonus)
   * if it would make the character over-weight.
   * @param amount Amount to modify weightSkillBonus by
   */
  addToWeightSkillBonus(amount: number): boolean {
    if (this._baseWeight + this._bonusWeightFromSkill + amount < this._usedWeight) {
      return false;
    }

    this._bonusWeightFromSkill += amount;

    return true;
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
  getAllStored(): Set<Item> {
    return new Set<Item>(this._backpack);
  }

  /**
   * Loads all the items of the given category
   * @param category Category to find
   */
  getAllStoredOfCategory(category: ItemCategory): Set<Item> {
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
   *   - Already equipment in slot and unequipExisting is false
   *   - Item in inventory, would go over max volume if currently equipped items
   * removed
   * @param item Item to equip
   */
  equipItem(item: Armour | Weapon, unequipExisting: boolean = true): boolean {
    if (isArmour(item)) {
      return this._equip<Armour>(item, this._equippedArmourByPart, this._equippedArmour);
    } else {
      return this._equip<Weapon>(item, this._equippedWeaponsByPart, this._equippedWeapons);
    }
  }

  private _equip<T extends Item>(item: T, partMap: Map<BodyPart, T>, partSet: Set<T>): boolean {
    // Already equipped
    if (partSet.has(item)) {
      return true;
    }

    const bodyParts = this._getBodyParts(item);

    const currentlyEquipped = new Set<T>();

    for (const part of bodyParts) {
      const equipment = partMap.get(part);

      if (equipment) {
        currentlyEquipped.add(equipment);
      }
    }

    // Check if holding this item would put us over-weight
    if (!this._backpack.has(item)) {
      if (this._usedWeight + item.weight > this._maxWeight) {
        return false;
      }
    }

    // Check if unequipping everything will put us over-volume, not counting this item if it is currently using volume
    let targetUsedVolume = this._usedVolume;
    let targetMaxVolume = this._maxVolume;

    for (const equippedItem of currentlyEquipped) {
      targetUsedVolume += equippedItem.volume;

      // If currently equipped item has a carryVolumeIncrease remove that amount from the maxVolume which will result from this change.
      if (isArmour(equippedItem) && equippedItem.carryVolumeIncrease !== undefined) {
        targetMaxVolume -= equippedItem.carryVolumeIncrease;
      }
    }

    if (this._backpack.has(item)) {
      targetUsedVolume -= item.volume;
    }

    if (isArmour(item) && item.carryVolumeIncrease !== undefined) {
      targetMaxVolume += item.carryVolumeIncrease;
    }

    if (targetUsedVolume > targetMaxVolume) {
      return false;
    }

    // Move all equipped items into backpack
    for (const equippedItem of currentlyEquipped) {
      for (const part of this._getBodyParts(equippedItem)) {
        partMap.delete(part);
      }
      partSet.delete(equippedItem);
      this._backpack.add(equippedItem);

      if (isArmour(equippedItem) && equippedItem.carryVolumeIncrease !== undefined) {
        this._bonusVolumeFromEquipment -= equippedItem.carryVolumeIncrease;
      }
    }

    // Set equipped item in all slots
    for (const part of bodyParts) {
      partMap.set(part, item);
    }

    partSet.add(item);

    if (isArmour(item) && item.carryVolumeIncrease !== undefined) {
      this._bonusVolumeFromEquipment += item.carryVolumeIncrease;
    }

    // Already calculated the target and max volumes earlier; update the stored value
    this._usedVolume = targetUsedVolume;
    this._maxVolume = targetMaxVolume;

    if (this._backpack.has(item)) {
      // Was in the backpack; remove it
      this._backpack.delete(item);
    } else {
      // Was not in the backpack; update the used weight
      this._usedWeight += item.weight;
    }

    return true;
  }

  /**
   * Tried to unequip the item. This will fail if there is not enough volume storage
   * to hold onto the item after removal.
   * @param item Item to unequip
   */
  unequipItem(item: Armour | Weapon): boolean {
    if (isArmour(item)) {
      return this._unequip<Armour>(item, this._equippedArmourByPart, this._equippedArmour);
    } else {
      return this._unequip<Weapon>(item, this._equippedWeaponsByPart, this._equippedWeapons);
    }
  }

  private _unequip<T extends Item>(item: T, partMap: Map<BodyPart, T>, partSet: Set<T>): boolean {
    if (!partSet.has(item)) {
      // It's not equipped; do nothing.
      return true;
    }

    let targetUsedVolume = this._usedVolume + item.volume;
    let targetMaxVolume = this._maxVolume;

    if (isArmour(item) && item.carryVolumeIncrease !== undefined) {
      targetMaxVolume -= item.carryVolumeIncrease;
    }

    if (targetUsedVolume > targetMaxVolume) {
      return false;
    }

    for (const part of this._getBodyParts(item)) {
      partMap.delete(part);
    }

    partSet.delete(item);

    this._backpack.add(item);

    this._usedVolume = targetUsedVolume;
    this._maxVolume = targetMaxVolume;

    if (isArmour(item) && item.carryVolumeIncrease !== undefined) {
      targetMaxVolume -= item.carryVolumeIncrease;
    }

    return true;
  }

  private _getBodyParts(item: Item): Set<BodyPart> {
    if (isArmour(item)) {
      return item.coverage;
    } else if (isWeapon(item)) {
      return item.equippedIn;
    } else {
      return new Set<BodyPart>();
    }
  }
}
