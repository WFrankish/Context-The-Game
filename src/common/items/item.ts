interface Dimension {
  width: number;
  height: number;
}

export default interface Item {
  name: string;
  weight: number;
  size: Dimension;
}
