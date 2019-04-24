class Ground {
  // Spawn rocket at position x,y
  // (x -> center of rocket, y -> bottom of rocket)
  constructor(canvasWidth, canvasHeight, groundHeight) {
    // The physics engine treats the rocket as a rectangle
    this.bodyWidth = canvasWidth;
    this.bodyHeight = groundHeight;
    this.body = Bodies.rectangle(0,
                                 canvasHeight-this.bodyHeight/2,
                                 this.bodyWidth,
                                 this.bodyHeight,
                                 {isStatic: true});
   this.groundColor = "#1663b1";
  }

  draw() {

    let x = this.body.position.x-this.bodyWidth/2;
    let y = this.body.position.y-this.bodyHeight/2;
    fill(this.groundColor);
    rect(x, y, this.bodyWidth, this.bodyHeight);
  }
}
