import { Transform } from '../common/transform.js';
import { Vector2 } from '../common/vector2.js';

const canvas = document.querySelector('canvas')!;
const context = canvas.getContext('2d')!;

export const width = 1176;
export const height = 944;
let screenToCanvas = Transform.identity();
export const camera = {
  position: new Vector2(0, 0),
  scale: 100,
};

function computeScale(): { scale: number; offset: Vector2 } {
  const aspect = width / height;
  const actualAspect = canvas.width / canvas.height;
  let scale: number;
  if (aspect <= actualAspect) {
    scale = clampScale(canvas.height / height);
  } else {
    scale = clampScale(canvas.width / width);
  }
  const actualWidth = scale * width;
  const actualHeight = scale * height;
  return {
    scale,
    offset: new Vector2(0.5 * (canvas.width - actualWidth), 0.5 * (canvas.height - actualHeight)),
  };
}

function clampScale(val: number): number {
  if(val >= 1){
    return Math.floor(val);
  } else {
    return 1 / Math.ceil(1/val);
  }
}

// Apply the suitable transform for drawing the user interface over the game
// world. The callback will receive the context it needs to draw, and can assume
// a resolution of (display.width, display.height) which will be scaled to fit.
export function draw(
  callback: (context: CanvasRenderingContext2D) => void
): void {
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.fillStyle = "black";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const { scale, offset } = computeScale();
  context.translate(offset.x, offset.y);
  context.scale(scale, scale);
  context.imageSmoothingEnabled = false;

  context.fillStyle = "white";
  context.fillRect(0, 0, width, height);

  callback(context);
}

export type MouseAction = 'up' | 'down' | 'move';
export type MouseButton = 'left' | 'right';
export interface MouseEvent {
  // Position of the mouse cursor in virtual coordinates.
  position: Vector2;
}
export interface MouseButtonEvent extends MouseEvent {
  button: MouseButton;
}
export type Handler<T> = (event: T) => void;

const mouseMoveHandlers: Set<Handler<MouseEvent>> = new Set();
const mouseUpHandlers: Set<Handler<MouseButtonEvent>> = new Set();
const mouseDownHandlers: Set<Handler<MouseButtonEvent>> = new Set();
export function onMouseMove(handler: Handler<MouseEvent>): void {
  mouseMoveHandlers.add(handler);
}
export function onMouseUp(handler: Handler<MouseButtonEvent>): void {
  mouseUpHandlers.add(handler);
}
export function onMouseDown(handler: Handler<MouseButtonEvent>): void {
  mouseDownHandlers.add(handler);
}
canvas.addEventListener('mousemove', (event) => {
  const mouseEvent: MouseEvent = {
    position: screenToCanvas.apply(new Vector2(event.x, event.y)),
  };
  for (const handler of mouseMoveHandlers) handler(mouseEvent);
});
function mouseButton(id: number): MouseButton | 'none' {
  switch (id) {
    case 0:
      return 'left';
    case 1:
      return 'right';
    default:
      return 'none';
  }
}
canvas.addEventListener('mouseup', (event) => {
  const position = screenToCanvas.apply(new Vector2(event.x, event.y));
  const button = mouseButton(event.button);
  if (button == 'none') return;
  for (const handler of mouseMoveHandlers) {
    const mouseEvent: MouseButtonEvent = { position, button };
    handler(mouseEvent);
  }
});
canvas.addEventListener('mousedown', (event) => {
  const mouseEvent: MouseEvent = {
    position: screenToCanvas.apply(new Vector2(event.x, event.y)),
  };
  for (const handler of mouseMoveHandlers) handler(mouseEvent);
});

// Make the canvas expand to fill the screen.
function resize() {
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  const { scale, offset } = computeScale();
  screenToCanvas = Transform.scale(1 / scale)
    .multiply(Transform.translate(offset.negated()))
    .multiply(Transform.scale(devicePixelRatio));
}
resize();
addEventListener('resize', resize);
