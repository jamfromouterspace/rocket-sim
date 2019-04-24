function setup() {
	var canvas = createCanvas(300,700);
	canvas.parent('canvas-container');
	preparePage();
	attachEventListeners();
  prepareEngine();
}

function draw() {
	if(running) {
		t = (millis()-t0)/1000;
		h = getHeight();
		setVelocity();
		updateDisplay();
	}
  background(75);
	ground.draw();
	rocket.draw();
}
