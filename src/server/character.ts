import * as net from './net.js';
import * as common from '../common/character.js';

class CharacterHandler extends common.CharacterHandler implements net.Handler<common.Snapshot, common.Update> {
  constructor(character: Character) {
    super(character);
  }
  defaultState(): common.Snapshot {
    return {
      zone: this.character.zone,
      position: [this.character.position.x, this.character.position.y],
      velocity: [this.character.velocity.x, this.character.velocity.y],
    };
  }
  encodeSnapshot(state: common.Snapshot): net.JsonObject {
    return (state as unknown) as net.JsonObject;
  }
}

export class Character extends common.Character {
  static create(id: string): Character {
    const character = new Character(id);
    character.channel = net.createChannel('/character/' + id, new CharacterHandler(character));
    return character;
  }
}
