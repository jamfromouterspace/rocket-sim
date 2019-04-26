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
   this.rocketColor = color("#cccccc");
   this.nozzleColor = color("#626a84");
   this.exhaustColor = color("#fae100");
   this.exhaustFillColor = color("#fa552a");
   this.explosionColor = color('hsl(54,100%,90%)');
   this.explosionColorHSL = [54,100,90];
   this.d = 10; // Explosion ellipse initial size
   this.h1 = 0; // Used to determine whether rocket is falling
   this.h2 = 0;
   this.body.mass = 25;
   this.initialX = this.body.position.x-this.bodyWidth/2;
   this.initialY = this.body.position.y-this.bodyHeight/2;
   this.scale = 1/56.18; // Experimentally determined.
   // this.scale = 1;
  }

  setParams(p) {
    this.params = p;
  }

  setScale(k) {
    this.scale = k;
  }

  x() {
    // return (this.scale)*this.body.position.x;
    return width/2;
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
    stroke("black")
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
  	vertex(x+2,y+60);
  	vertex(x+8,y+60);
  	vertex(x+10,y+70);
  	vertex(x,y+70);
  	endShape(CLOSE);

  }

  drawExhaust() {
    let x = this.body.position.x-this.bodyWidth/2;
    let y = this.body.position.y-this.bodyHeight/2;
    x = this.initialX + this.scale*(x-this.initialX);
    y = this.initialY + this.scale*(y-this.initialY);
    fill(this.exhaustColor)
    stroke(this.exhaustFillColor)
    beginShape();
    curveVertex(x,y+70);
    curveVertex(x,y+70);
    curveVertex(x,y+73);
    curveVertex(x+4,y+85);
    curveVertex(x+6,y+85);
    curveVertex(x+10,y+75);
    curveVertex(x+10,y+70);
    curveVertex(x+1,y+70);
    endShape(CLOSE);
  }

  explode() {
    let x = this.x();
    let y = (height-this.y())-20;
    if (this.d < 3000) {
      this.d += 25;
      if(this.explosionColorHSL[2] > 40) {
        // Darken initiallly
        let light = this.explosionColorHSL[2] - 1;
        this.explosionColor = color('hsl(54,100%,'+light+'%)');
        this.explosionColorHSL[2] = light;
      }
      else if (this.explosionColorHSL[2] <= 40 && this.explosionColorHSL[0] > 20) {
        // Become more red
        let hue = this.explosionColorHSL[0] - 1;
        this.explosionColor = color('hsl('+hue+',100%,40%)');
        this.explosionColorHSL[0] = hue;
      }
    }
    if (this.d > 2500 && this.explosionColorHSL[1] > 3){
      // Become grey (soot)
      let hue = this.explosionColorHSL[0];
      let sat = this.explosionColorHSL[1] - 0.3;
      this.explosionColor = color('hsl('+hue+','+sat+'%,40%)');
      this.explosionColorHSL[1] = sat;
    }
    fill(this.explosionColor);
    stroke(this.exhaustFillColor);
    ellipse(x, y, this.d, this.d/2);
  }
}
