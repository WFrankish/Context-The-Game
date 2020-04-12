
type Input = 'up' | 'down' | 'left' | 'right' | 'primary' | 'secondary' | 'camUp' | 'camDown' | 'camLeft' | 'camRight';

type IInputs = {
  [key in Input]: number;
}

export class Inputs implements IInputs {
  up = 0;
  down = 0;
  left = 0;
  right = 0;
  primary = 0;
  secondary = 0;
  camUp = 0;
  camDown = 0;
  camLeft = 0;
  camRight = 0;
}
export const inputs = new Inputs();
const keyBindings: Map<string, Input> = new Map([
  ['KeyW', 'up'],
  ['KeyA', 'left'],
  ['KeyS', 'down'],
  ['KeyD', 'right'],
  ['ArrowUp', 'camUp'],
  ['ArrowLeft', 'camLeft'],
  ['ArrowDown', 'camDown'],
  ['ArrowRight', 'camRight'],
]);
const mouseBindings: Map<number, Input> = new Map([
  [0, 'primary'],
  [2, 'secondary'],
]);
addEventListener('keydown', (event: KeyboardEvent) => {
  if (!keyBindings.has(event.code)) return;
  const action = keyBindings.get(event.code)!;
  inputs[action] = 1;
});
addEventListener('keyup', (event: KeyboardEvent) => {
  if (!keyBindings.has(event.code)) return;
  const action = keyBindings.get(event.code)!;
  inputs[action] = 0;
});
addEventListener('contextmenu', (event: MouseEvent) => event.preventDefault());
addEventListener('mousedown', (event: MouseEvent) => {
  if (!mouseBindings.has(event.button)) return;
  const action = mouseBindings.get(event.button)!;
  inputs[action] = 1;
});
addEventListener('mouseup', (event: MouseEvent) => {
  if (!mouseBindings.has(event.button)) return;
  const action = mouseBindings.get(event.button)!;
  inputs[action] = 0;
});
