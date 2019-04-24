class Rocket {
  // Spawn rocket at position x,y
  // (x -> center of rocket, y -> bottom of rocket)
  constructor(x,y) {
    // The physics engine treats the rocket as a rectangle
    this.bodyWidth = 10;
    this.bodyHeight = 70;
    this.body = Bodies.rectangle(x,
                                 y - this.bodyHeight/2,
                                 this.bodyWidth,
                                 this.bodyHeight);
   this.rocketColor = "#cccccc"
   this.nozzleColor = "#626a84"
   this.body.mass = 25;
   this.initialX = this.body.position.x-this.bodyWidth/2;
   this.initialY = this.body.position.y-this.bodyHeight/2;
   this.scale = 1/42.448; // Experimentally determined.
   // this.scale = 1;
  }

  setParams(p) {
    this.params = p;
  }

  setScale(k) {
    this.scale = k;
  }

  x() {
    return (this.scale)*this.body.position.x;
  }

  y() {
    return (this.scale)*(700-(this.body.position.y + this.bodyHeight/2));
  }

  draw() {
    // Convert centroid coordinate system (matter.js)
    // to top-left coordinate system (p5.js)
    let x = this.body.position.x-this.bodyWidth/2;
    let y = this.body.position.y-this.bodyHeight/2;
    // Apply scaling factor
    x = this.initialX + this.scale*(x-this.initialX);
    y = this.initialY + this.scale*(y-this.initialY);
    // Head
  	fill(this.rocketColor);
  	beginShape();
  	vertex(x+5,y);
  	vertex(x+10,y+10);
  	vertex(x,y+10);
  	endShape(CLOSE);
  	// Body
  	fill(this.rocketColor)
  	beginShape();
  	vertex(x+10,y+10);
  	vertex(x+10,y+60);
  	vertex(x,y+60);
  	vertex(x,y+10);
    endShape(CLOSE);
  	// Nozzle
  	fill(this.nozzleColor)
  	beginShape();
  	vertex(x,y+60);
  	vertex(x+10,y+60);
  	vertex(x+14,y+70);
  	vertex(x-4,y+70);
  	endShape(CLOSE);
  }
}
