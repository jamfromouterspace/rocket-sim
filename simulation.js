
function setVelocity() {
    m = getMass();
    v_prev = v;
    t_prev = t;
    v = -rocket.params['Ce']*Math.log(m/m0) - g*t;
    // Prevent rocket from going through ground
    if(h > 20 || !reached_burnout) 
      Body.setVelocity(rocket.body, {x:0,y:-(v/(10*k))});
    if(reached_burnout && !v_burnout) v_burnout = v;
}

function getMass() {
  if(m <= rocket.params['m_final']) {
    if(!reached_burnout) { 
      reached_burnout = true; 
      h_burnout = h;
    }
    return rocket.params['m_final'];
  } else {
    return m0 - rocket.params['m_dot']*t;
  }
}

function getHeight() {
  return 10*k*(rocket.y() - h0);
}

function getAcceleration() {
  return (v-v_prev)/(t-t_prev);
}

function updateDisplay() {
  $("#sim-time").html(t.toPrecision(4));
  $("#sim-height").html(h.toPrecision(4));
  // $("#sim-accel").html(a.toPrecision(4));
  $("#sim-hmax").html(h_max.toPrecision(4));
  if(reached_burnout) {
    $("#sim-hb").html(h_burnout.toPrecision(4));
    $("#sim-vb").html(v_burnout.toPrecision(4));
  }
}

function run() {
  rocket.setParams(params);
  if (rocket.params['h_burnout'] > 1000) k = 1.5;
  else if (rocket.params['h_burnout'] > 10000) k = 2;
  else if (rocket.params['h_burnout'] > 20000) k = 2.5;
  else if (rocket.params['h_burnout'] > 100000) k = 3;
  m0 = rocket.params['m_initial'];
  m = m0;
  t0 = millis();
  t_prev = t0;
  h0 = rocket.y();
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
  reached_burnout = false;
  v_prev = 0;
  a = 0;
  h_max = 0;
  v_burnout = undefined;
  h_burnout = undefined;
  v = 0;
  engine = Engine.create();
  world = engine.world;
  ground = new Ground(width*2, height, 15);
	rocket = new Rocket(width/2, height-ground.bodyHeight);
	// Create world
  Engine.run(engine);
	World.add(world, ground.body);
  World.add(world, rocket.body);
}
