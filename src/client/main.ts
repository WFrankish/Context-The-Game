let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;

const main = () => {
    canvas = document.getElementsByTagName("canvas")[0];
    ctx = canvas.getContext("2d")!;
}

main();