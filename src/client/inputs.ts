import * as common from '../common/inputs.js';
export { Input, Inputs } from '../common/inputs.js';

export const inputs = new common.Inputs();
const keyBindings: Map<string, common.Input> = new Map([
  ['KeyW', 'up'],
  ['KeyA', 'left'],
  ['KeyS', 'down'],
  ['KeyD', 'right'],
  ['ArrowUp', 'camUp'],
  ['ArrowLeft', 'camLeft'],
  ['ArrowDown', 'camDown'],
  ['ArrowRight', 'camRight'],
  ['KeyI', 'inventory'],
]);
const mouseBindings: Map<number, common.Input> = new Map([
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
