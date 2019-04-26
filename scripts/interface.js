function preparePage() {
  $("#page-loader").css("opacity", 0);
  $("#page-loader").addClass("active", 0);
  $("#page-loader").addClass("fade-in");
  setTimeout(function() {
    $("#wrapper").addClass("fade-in");
    $("#page-loader").removeClass("active");
  }, 800);
}

function updateField(name, disable) {
  // console.log('Isp', userInput['Isp']);
  // console.log('Ce', userInput['Ce']);
  // console.log(params[name]);
  let selector = 'input[name="' + name + '"]';
  if(params[name]) {
    $(selector)[0].value = params[name].toPrecision(6);
  }
  else $(selector)[0].value = null;
  $(selector).attr('disabled', false);
}

function paramInput(p) {
  let res = params[p] && userInput[p][1]
  res &= !$('input[name="' + p + '"]').attr('disabled');
  return res;
}

function userDeleted(p) {
  let res = userInput[p][1] == 0
  res &= userInput[p][0] == 1;
  res &= !$('input[name="' + p + '"]').attr('disabled');
  return res;
}

// List of properties that were last solved
let prev = [];
function setProperty(p) {
  // inputs.append(p);
  if (userDeleted(p)) {
    showSolving();
    params[p] = null;
    for(i of prev) {
      params[i] = null;
      updateField(i, false);
    }
    prev = [];
  } else {
    prev = [];
    let new_solutions = 1;
    let i = 0;
    // Show loader
    showSolving();
    while(new_solutions > 0) {
      i++
      let s = solve();
      prev = prev.concat(s);
      new_solutions = s.length;
    }
    for(p in params) {
      if (paramInput(p))
        updateField(p, false);
      else if(params[p])
        updateField(p, true);
    }
  }
}

function solve() {
  // Solve properties that depend on variables that have changed
  let solved = [];
  for(p in properties) {
    let solution = properties[p].solve(params);
    if(solution && solution != params[p] && solution >= 0) {
      solved.push(p);
      params[p] = solution;
    }
  }
  return solved;
}


function validate() {
  // Make sure all the values make sense before the sim can be started
  let invalid = false; // In case there is an invalid input (e.g. negative)
  let valid = true;
  let ready = true;
  // Check masses
  let keys = ['m_prop', 'm_payload', 'm_inert', 'm_initial',
                  'm_final', 'MR', 'R', 'zeta', 'epsilon', 'lambda'];
  for(i of keys) {
    invalid |= params[i] < 0;
    valid &= !invalid;
    valid &= params[i] != null
  }
  if (params['m_prop'] == 0) {
    invalid = true;
    valid = false;
  }
  ready &= valid;
  if (invalid) $("#mass-header").addClass("invalid");
  else if (valid) $("#mass-header").addClass("valid");
  else $("#mass-header").removeClass("invalid valid");

  // Check propulsion
  keys = ['Isp', 'Ce', 'T', 'm_dot', 'a_max']
  invalid = false;
  valid = true;
  for(i of keys) {
    invalid |= params[i] < 0 || params[i] === 0;
    valid &= !invalid;
    valid &= params[i] != null || i == 'a_max';
  }
  ready &= valid;
  if (invalid) $("#propulsion-header").addClass("invalid");
  else if (valid) $("#propulsion-header").addClass("valid");
  else $("#propulsion-header").removeClass("invalid valid");

  // Check Kinematics
  keys = ['v_burnout', 't_burnout', 'h_burnout', 'h_max'];
  invalid = false;
  valid = true;
  for(i of keys) {
    invalid |= params[i] < 0 || params[i] === 0;
    valid &= !invalid;
    valid &= params[i] != null;
  }
  ready &= valid;
  if (invalid) $("#kinematics-header").addClass("invalid");
  else if (valid) $("#kinematics-header").addClass("valid");
  else $("#kinematics-header").removeClass("invalid valid");

  if(ready) {
    $(".start").attr("disabled", false);
    $(".start").addClass("blue");
  }
  else {
    $(".start").attr("disabled", true);
    $(".start").removeClass("blue");
  }
}

function attachEventListeners() {
  var inputCallback = function() {
  	 if (this.value == '' || this.value >= 0){
  		let name = this.name;
  		userInput[name][0] = userInput[name][1];
  		if(this.value) {
  			let val = parseFloat(this.value);
  			params[name] = val;
  			userInput[name][1] = 1;
  		} else {
  			userInput[name][1] = 0;
  		}
  		setProperty(this.name);
  		validate();
  	} else {
  		this.value = '';
  	}
  }

  var reset = function() {
    // Two-click feature.
    // First click resets the simulation, second resets the params
    if(rocket.params) {
      resetSim();
      $(".start").attr("disabled", false);
      $("html, body").animate({
        scrollTop: $('#simulation-details').offset().top - $(window).height()/2
      }, 500);
    }
    else {
      for(i in params) {
        params[i] = null;
        updateField(i, false);
      }
      if(plot) plot.clear();
      $("#sample").attr("disabled", false);
      $(".start").attr("disabled", true);
      $(".start").removeClass("blue");
      $(".stop").attr("disabled", true);
      $("#mass-header").removeClass("invalid valid");
      $("#kinematics-header").removeClass("invalid valid");
      $("#propulsion-header").removeClass("invalid valid");
      $("#sim-time").html('0');
      $("#simulation-display").css('opacity', 0);
      $("#simulation-display").addClass('hidden');
      $("#simulation-display").removeClass('fade-in');
    }
  }

  var stop = function() {
    $(".start").attr("disabled", true);
    stopSim();
  }

  var setSample = function() {
    reset();
    const sampleData = {
      'Isp'       : 130,
      'Ce'        : null,
      'T'         : null,
      'm_dot'     : 3,
      'a_max'     : null,
      'm_prop'    : 12,
      'm_payload' : 25,
      'm_inert'   : null,
      'm_initial' : null,
      'm_final'   : null,
      'MR'        : null,
      'R'         : null, // 1/MR
      'epsilon'   : 0.6, // Structural
      'zeta'      : null, // 1 - epsilon
      'lambda'    : null, // Payload
      'v_burnout' : 274,
      't_burnout' : 4,
      'h_burnout' : null,
      'h_max'     : null,
    }
    params = sampleData;
    for(i in params) {
      setProperty(i);
      userInput[i] = [0,0];
    }
    for(i in params) {
      // Enable editing
      $('input[name="' + i + '"]').attr('disabled', false);
    }
    validate();
  }

  var aboutCallback = function() {
    $('.ui.modal').modal('show');
  }

  var startSimulation = function() {
    run();
    $(".stop").attr("disabled", false);
    $(".start").attr("disabled", true);
    $("#sample").attr("disabled", true);
    $("#simulation-display").removeClass('hidden');
    $("html, body").animate({
      scrollTop: $('#simulation-details').offset().top - $(window).height()/2
    }, 500);
    $("#simulation-display").addClass('fade-in');
  }

  $("#toggle-plots").on("click", togglePlots);
  $('input').on('change', inputCallback);
  $('.reset').on('click', reset);
  $('.start').on('click', startSimulation);
  $('.stop').on('click', stop);
  $('#sample').on('click', setSample);
  $('#about-open').on('click', aboutCallback);
  $('#about-close > button').on('click', function() {
    $('.ui.modal').modal('hide');
  });
  $(document).keyup(function(e) {
       if(e.key === "Escape") {
         $('.ui.modal').modal('hide');
      }
  });
  $(window).on("resize",function(e) {
      if(plot) plot.updateDimensions();
  });
}


function showSolving() {
  // Show loader for longer than it actually takes to solve
  // because solving is instantaneous
  $(".solving").addClass("active");
  setTimeout(()=>{$(".solving").removeClass("active");}, 200);
}
