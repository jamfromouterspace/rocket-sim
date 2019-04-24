
function setVelocity(v) {
  if(v) {
    // For debugging
    Body.setVelocity(rocket.body, {x:0,y:-(v/10)});
  } else {
    v = -rocket.params['Ce']*Math.log(M(t)/m0) - g*t;
    Body.setVelocity(rocket.body, {x:0,y:-(v/(10*k))});
  }
}

function M(t) {
  // Implements mass(time)
  if(t >= rocket.params['t_burnout']) {
    return rocket.params['m_final'];
  } else {
    return m0 - rocket.params['m_dot']*t;
  }
}

function getHeight() {
  return 10*k*(rocket.y() - y0);
}

function updateDisplay() {
  $("#sim-time").html(t.toPrecision(4));
  $("#sim-height").html(h.toPrecision(4));
}

function run() {
  rocket.setParams(params);
  if (rocket.params['h_burnout'] > 1000) k = 1.5;
  else if (rocket.params['h_burnout'] > 10000) k = 2;
  else if (rocket.params['h_burnout'] > 20000) k = 2.5;
  else if (rocket.params['h_burnout'] > 100000) k = 3;
  m0 = rocket.params['m_initial'];
  t0 = millis();
  y0 = rocket.y();
  running = true;
}

function stopSim() {
  running = false;
}

function resetSim() {
  running = false;
  rocket.params = undefined;
  World.clear(engine.world);
  Engine.clear(engine);
  prepareEngine();
}



function prepareEngine() {
  engine = Engine.create();
  world = engine.world;
  ground = new Ground(width*2, height, 15);
	rocket = new Rocket(width/2, height-ground.bodyHeight);
	// Create world
  Engine.run(engine);
	World.add(world, ground.body);
  World.add(world, rocket.body);
	h1 = rocket.y();
}
