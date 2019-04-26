function setVelocity() {
    m = getMass();
    v_prev = v;
    t_prev = t;
    v = -rocket.params['Ce']*Math.log(m/m0) - g*t;
    // Prevent rocket from going through ground
    if(h > 20 || !reached_burnout)
      Body.setVelocity(rocket.body, {x:0,y:-(v/(10*k))});
    if(reached_burnout && !v_burnout) v_burnout = v;
    // Save velocity and time;
    data.vt.push({velocity: v, time: t});
    data.ht.push({height: h, time: t});
    if(v > v_max) v_max = v;
    else if(v < v_min) v_min = v;
}

function getMass() {
  if(m <= rocket.params['m_final']) {
    if(!reached_burnout) {
      reached_burnout = true;
      h_burnout = h;
      t_burnout = t;
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
  $("#sim-velocity").html(v.toPrecision(4));
  if(reached_burnout) {
    $("#sim-hb").html(h_burnout.toPrecision(4));
    $("#sim-vb").html(v_burnout.toPrecision(4));
    $("#sim-tb").html(t_burnout.toPrecision(4));
  }
}

function run() {
  if(plot) plot.clear();
  if(currentPlot == "ht")
    plot = new Plot("time", "height", "Time (s)", "Height (m)");
  else
    plot = new Plot("time", "velocity", "Time (s)", "Velocity (m/s)");
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
  data.vt = [{velocity:0,time:0}]; // Reset data
  data.ht = [{height:0,time:0}];
  // togglePlots();
  // togglePlots();
  plot.update(data[currentPlot]);
  prepareEngine();
  updateDisplay();
}

function prepareEngine() {
  reached_burnout = false;
  v_prev = 0;
  a = 0;
  h_max = 0;
  v_min = 0;
  v_max = 0;
  t = 0;
  v_burnout = undefined;
  h_burnout = undefined;
  v = 0;
  h = 0;
  engine = Engine.create();
  world = engine.world;
  ground = new Ground(width*2, height, 15);
	rocket = new Rocket(width/2, height-ground.bodyHeight);
	// Create world
  Engine.run(engine);
	World.add(world, ground.body);
  World.add(world, rocket.body);
}


function updatePlots() {
  let range = {};
  if(currentPlot === "ht") {
    range.y = {max: h_max, min: 0};
    range.x = {max: t, min: 0};
    plot.update(data.ht, range);
  } else {
    range.y = {max: v_max, min: v_min};
    range.x = {max: t, min: 0};
    plot.update(data.vt, range);
  }
}


function togglePlots() {
  if(currentPlot === "vt") {
    currentPlot = "ht";
    $("#toggle-plots").html("Velocity");
    plot.clear();
    plot = new Plot("time", "height", "Time (s)", "Height (m)");
    updatePlots();
  } else {
    currentPlot = "vt";
    $("#toggle-plots").html("Height");
    plot.clear();
    plot = new Plot("time", "velocity", "Time (s)", "Velocity (m/s)");
    updatePlots();
  }
}
