const creationInit = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    let img = new Image();
    img.src = '../../assets/gandalf_the_girthy.png';
    ctx.drawImage(img, 0, 0);

}
