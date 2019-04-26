function setup() {
	var canvas = createCanvas(300,700);
	canvas.parent('canvas-container');
	preparePage();
	attachEventListeners();
 	prepareEngine();
 	t1 = millis();
}

function draw() {
	clear();
	if(running) {
		t = (millis()-t0)/1000;
		h = getHeight();
		a = getAcceleration();
		if(h > h_max) h_max = h;
		setVelocity();
		updateDisplay();
		plot.update();
	}
	if (h <= 0 && reached_burnout)
		running = false;
  background('rgba(0,0,0,0.2)');

	ground.draw();
	rocket.draw();

	if(running && !reached_burnout)
		rocket.drawExhaust();
	if(h_max > 10 && getHeight() < 10)
		rocket.explode();
}
