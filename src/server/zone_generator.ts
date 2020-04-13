import { ZoneData } from '../common/zone.js';
import { shuffle } from '../common/utils.js';
import { Vector2 } from '../common/vector2.js';

const minRoom = 3;
const maxRoom = 5;
const branchFactor = 0.05;
const noDeadEndsFactor = 0.99;

let dungeon: string[] = [];

/**
 * a copy of the maze with an index for each area of space
 */
let mazeLogic: number[][] = [];
let rooms: { x: number; y: number; w: number; h: number }[];
let index = 0;

export function generateZone(x: number, y: number, roomCount: number): ZoneData {
  dungeon = [];
  mazeLogic = [];
  rooms = [];
  index = 0;

  x = makeOdd(x);
  y = makeOdd(y);

  for (let j = 0; j < y; j++) {
    const row = new Array<number>();
    for (let i = 0; i < x; i++) {
      row.push(0);
    }
    mazeLogic.push(row);
    dungeon.push(''.padEnd(x, '#'));
  }

  let [h, w] = randomDimentions();
  makeRoom(makeOdd(x / 2 - w / 2), makeOdd(y / 2 - h / 2), w, h);

  [h, w] = randomDimentions();
  makeRoom(1, 1, w, h);

  [h, w] = randomDimentions();
  makeRoom(x - w - 1, 1, w, h);

  [h, w] = randomDimentions();
  makeRoom(1, y - h - 1, w, h);

  [h, w] = randomDimentions();
  makeRoom(x - w - 1, y - h - 1, w, h);

  for (let i = 5; i < roomCount; i++) {
    [h, w] = randomDimentions();
    let x1 = makeOdd(randBetween(0, x - w - 1));
    let y1 = makeOdd(randBetween(0, y - h - 1));
    makeRoom(x1, y1, w, h);
  }
  for (let i = 1; i < x; i += 2) {
    for (let j = 1; j < y; j += 2) {
      if (wallAt(i, j)) {
        makeCorridor(i, j);
      }
    }
  }
  connectUp();
  quashDeadEnds();

  shuffle(rooms);

  // double size
  const newResult = new Array<string>();
  for(let j = 0; j < y; j++){
    let newRow = "";
    for(let i = 0; i < x; i++){
      newRow += dungeon[j][i] + dungeon[j][i];
    }
    newResult.push(newRow);
    newResult.push(newRow);
  }
  dungeon = newResult;

  ['a', 'b', 'x', 'y'].forEach((c, i) => {
    let room = rooms[i];
    let x: number;
    let y: number;
    do {
      x = randBetween(room.x*2, room.x*2 + room.w*2);
      y = randBetween(room.y*2, room.y*2 + room.h*2);
    } while (dungeon[y][x] !== ' ');
    setTile(x, y, c, -1);
  });

  return {
    layout: dungeon.join('\n'),
    obstacles: {
      a: {
        type: 'Obstacle',
        image: 'chest.png',
      },
      b: {
        type: 'Obstacle',
        image: 'chest.png',
      },
      x: {
        type: 'Portal',
        destination: {
          zone: 'example',
          portal: 'y',
        },
      },
      y: {
        type: 'Portal',
        destination: {
          zone: 'example',
          portal: 'x',
        },
      },
    },
    characters: new Set(),
  };
}

function setTile(x: number, y: number, val: string, index: number) {
  x = Math.trunc(x);
  y = Math.trunc(y);
  const row = dungeon[y];
  dungeon[y] = row.substr(0, x) + val + row.substr(x + 1);
  if (val === ' ') {
    mazeLogic[y][x] = index;
  }
}

function makeRoom(x: number, y: number, w: number, h: number) {
  let clear = true;
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      clear == clear && wallAt(i + x, j + y);
    }
  }

  if (!clear) {
    return;
  }

  index++;
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      setTile(i + x, j + y, ' ', index);
    }
  }

  rooms.push({ x, y, w, h });
}

// use random depth first search to explore every space
function makeCorridor(x: number, y: number) {
  index++;
  let location = new Vector2(x, y);
  setTile(x, y, ' ', index);
  const stack = [location];
  while (stack.length !== 0) {
    location = stack[0];
    const options = new Array<Vector2>();
    if (wallAt(location.x - 2, location.y)) {
      options.push(location.add(new Vector2(-2, 0)));
    }
    if (wallAt(location.x + 2, location.y)) {
      options.push(location.add(new Vector2(2, 0)));
    }
    if (wallAt(location.x, location.y - 2)) {
      options.push(new Vector2(location.x, location.y - 2));
    }
    if (wallAt(location.x, location.y + 2)) {
      options.push(new Vector2(location.x, location.y + 2));
    }
    if (options.length !== 0) {
      const rand = randBetween(0, options.length);
      const [newLoc] = options.splice(rand, 1);
      const mx = location.x + (newLoc.x - location.x) / 2;
      const my = location.y + (newLoc.y - location.y) / 2;
      setTile(mx, my, ' ', index);
      setTile(newLoc.x, newLoc.y, ' ', index);
      stack.unshift(newLoc);
    } else {
      stack.pop();
    }
  }
}

// connect up all the seperate rooms and corridors by knocking down random adjacent walls
function connectUp() {
  const indices = new Array<number>();
  for (let x = 0; x < index; x++) {
    indices.push(x + 1);
  }
  let [chosen] = indices.splice(randBetween(0, indices.length), 1);

  while (indices.length > 0) {
    const options = new Array<[number, number, number]>();
    for (let x = 0; x < dungeon[0].length - 1; x++) {
      for (let y = 2; y < dungeon.length - 2; y += 2) {
        if (mazeLogic[y - 1][x] !== mazeLogic[y + 1][x] && mazeLogic[y - 1][x] != 0 && mazeLogic[y + 1][x] != 0) {
          if (mazeLogic[y - 1][x] == chosen) {
            options.push([x, y, mazeLogic[y + 1][x]]);
          } else if (mazeLogic[y + 1][x] == chosen) {
            options.push([x, y, mazeLogic[y - 1][x]]);
          }
        }
      }
    }

    for (let x = 2; x < dungeon[0].length - 2; x += 2) {
      for (let y = 0; y < dungeon.length - 1; y++) {
        if (mazeLogic[y][x - 1] !== mazeLogic[y][x + 1] && mazeLogic[y][x - 1] != 0 && mazeLogic[y][x + 1] != 0) {
          if (mazeLogic[y][x - 1] == chosen) {
            options.push([x, y, mazeLogic[y][x + 1]]);
          } else if (mazeLogic[y][x + 1] == chosen) {
            options.push([x, y, mazeLogic[y][x - 1]]);
          }
        }
      }
    }
    if (options.length > 0) {
      const [rand] = options.splice(randBetween(0, options.length), 1);
      const randPos = new Vector2(rand[0], rand[1]);
      setTile(randPos.x, randPos.y, ' ', rand[2])
      for (let option of options) {
        if (branchFactor > Math.random() && option[2] == rand[2]) {
          const vector = new Vector2(option[0], option[1]);
          setTile(vector.x, vector.y, ' ', rand[2]);
        }
      }
      for (let y = 0; y < dungeon.length; y++) {
        for (let x = 0; x < dungeon[y].length; x++) {
          if (mazeLogic[y][x] == chosen) {
            mazeLogic[y][x] = rand[2];
          }
        }
      }
      chosen = rand[2];
    }
    indices.splice(indices.indexOf(chosen), 1);
  }
}

function quashDeadEnds() {
  const deadEnds = new Array<Vector2[]>();
  for (let y = 1; y < dungeon.length - 1; y++) {
    for (let x = 1; x < dungeon[y].length - 1; x++) {
      if (!wallAt(x, y)) {
        const adjacents = new Array<Vector2>();
        adjacents.push(new Vector2(x, y));
        if (!wallAt(x - 1, y)) {
          adjacents.push(new Vector2(x - 1, y));
        }
        if (!wallAt(x + 1, y)) {
          adjacents.push(new Vector2(x + 1, y));
        }
        if (!wallAt(x, y - 1)) {
          adjacents.push(new Vector2(x, y - 1));
        }
        if (!wallAt(x, y + 1)) {
          adjacents.push(new Vector2(x, y + 1));
        }
        if (adjacents.length == 2) {
          deadEnds.push(adjacents);
        }
      }
    }
  }
  while (deadEnds.length > 0) {
    const deadend = deadEnds.shift()!;
    if (noDeadEndsFactor >  Math.random()) {
      const dim1 = deadend[0];
      const dim2 = deadend[1];
      setTile(dim1.x, dim1.y, '#', 0);
      const adjacents = new Array<Vector2>();
      adjacents.push(dim2);
      if (wallAt(dim2.x, dim2.y - 1)) {
        adjacents.push(new Vector2(dim2.x, dim2.y - 1));
      }
      if (wallAt(dim2.x, dim2.y + 1)) {
        adjacents.push(new Vector2(dim2.x, dim2.y + 1));
      }
      if (wallAt(dim2.x - 1, dim2.y)) {
        adjacents.push(new Vector2(dim2.x - 1, dim2.y));
      }
      if (wallAt(dim2.x + 1, dim2.y)) {
        adjacents.push(new Vector2(dim2.x + 1, dim2.y));
      }
      if (adjacents.length == 2) {
        deadEnds.unshift(adjacents);
      }
    }
  }
}

function wallAt(x: number, y: number) {
  x = Math.trunc(x);
  y = Math.trunc(y);
  return y >= 0 && x >= 0 && y < dungeon.length && x < dungeon[y].length && dungeon[y][x] === '#';
}

function makeOdd(value: number) {
  value = Math.trunc(value);
  return value % 2 === 0 ? value + 1 : value;
}

function randBetween(low: number, high: number) {
  return Math.trunc(low + (high - low) * Math.random());
}

function randomDimentions() {
  return [makeOdd(randBetween(minRoom, maxRoom)), makeOdd(randBetween(minRoom, maxRoom))];
}
