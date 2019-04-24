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
		a = getAcceleration();
		if(h > h_max) h_max = h;
		setVelocity();
		updateDisplay();
	}
  background(75);
	ground.draw();
	rocket.draw();
}
