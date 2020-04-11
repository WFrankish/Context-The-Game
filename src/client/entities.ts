import {Entity} from 'src/common/entity';
import {Vector2} from 'src/common/vector2';

/**
 * An entity that is visible in the world
 */
export abstract class VisibleEntity extends Entity {
  abstract draw(): void;
}

/**
 * A visible entity that moves within the game world
 */
export abstract class Mob extends VisibleEntity {
  velocity: Vector2 = new Vector2(0, 0);

  setVelocity(newVelocity: Vector2): void {
    this.velocity = newVelocity;
  }

  updatePosition(deltaTime: number): void {
    this.position.add(this.velocity.multiply(deltaTime));
  }

  abstract draw(): void;
}

/**
 * A visible entity that mobs can interact with
 */
export abstract class InteractableEntity extends VisibleEntity {
  abstract draw(): void;

  abstract interact(interactor: Mob): void;
}