const Engine = Matter.Engine,
	    World = Matter.World,
	    Bodies = Matter.Bodies,
	    Body = Matter.Body;

var engine, world, rocket, ground;
var running = false; // Simulation is running
var t0; // Time at the start of simulation
var h0; // Initial height
var m0; // Initial mass
var m; // Current mass
var v; // Current velocity
var v_prev; // Keep track of acceleration
var t_prev;
var a;
var reached_burnout;
var v_burnout;
var h_burnout;
var h_max;
var k = 1;
var t;

const g = 9.807;

var params = {
  'Isp'       : null,
  'Ce'        : null,
  'T'         : null,
  'm_dot'     : null,
  'a_max'     : null,
  'm_prop'    : null,
  'm_payload' : null,
  'm_inert'   : null,
  'm_initial' : null,
  'm_final'   : null,
  'MR'        : null,
  'R'         : null, // 1/MR
  'epsilon'   : null, // Structural
  'zeta'      : null, // 1 - epsilon
  'lambda'    : null, // Payload
  'v_burnout' : null,
  't_burnout' : null,
  'h_burnout' : null,
  'h_max'     : null,
}

var userInput = {
  'Isp'       : [0,0],
  'Ce'        : [0,0],
  'T'         : [0,0],
  'm_dot'     : [0,0],
  'a_max'     : [0,0],
  'm_prop'    : [0,0],
  'm_payload' : [0,0],
  'm_inert'   : [0,0],
  'm_initial' : [0,0],
  'm_final'   : [0,0],
  'MR'        : [0,0],
  'R'         : [0,0], // 1/MR
  'epsilon'   : [0,0], // Structural
  'zeta'      : [0,0], // 1 - epsilon
  'lambda'    : [0,0], // Payload
  'v_burnout' : [0,0],
  't_burnout' : [0,0],
  'h_burnout' : [0,0],
  'h_max'     : [0,0],
}

var properties = {
  'T' : new Property('T', [ ['Ce', 'm_dot'], ['m_final', 'a_max'] ],
										      [
                            ([ce,mdot]) => { return ce*mdot },
                            ([mf,amax]) => { return mf*(amax+g) },
                          ]),
  'Ce' : new Property('Ce', [ ['Isp'], ['T', 'm_dot'],
                              ['v_burnout', 't_burnout', 'R'],
                              ['h_burnout', 't_burnout', 'R'] ],
										      [
                            ([isp]) => { return isp*g },
                            ([thrust,mdot]) => { return thrust/mdot },
                            ([vb,tb,r]) => {
                              return (vb+g*tb)/Math.log(r);
                            },
                            ([hb,tb,r]) => {
                              return (r-1)*(hb/tb+0.5*g*tb)/(r-1-Math.log(r));
                            }
                          ]),
  'Isp' : new Property('Isp', [ ['Ce'], ['T', 'm_dot'] ],
										      [
                            ([ce]) => { return ce/g },
                            ([thrust,mdot]) => { return thrust/(mdot*g) }
                          ]),
  'm_dot' : new Property('m_dot', [ ['m_prop', 't_burnout'], ['T', 'Ce'] ],
										      [
                            ([mprop, tb]) => { return mprop/tb },
                            ([thrust,ce]) => { return thrust/ce }
                          ]),
  'a_max' : new Property('a_max', [ ['T', 'm_final'] ],
										      [
                            ([thrust, mf]) => { return (thrust-mf*g)/mf },
                          ]),
  'm_initial' : new Property('m_initial', [ ['m_prop', 'm_final'],
                                            ['R', 'm_final'] ],
										      [
                            ([mp, mf]) => { return mp+mf },
                            ([r, mf]) => { return r*mf }
                          ]),
  'm_final' : new Property('m_final', [ ['m_initial', 'm_prop'],
                                        ['m_inert', 'm_payload'],
                                        ['MR', 'm_initial'] ],
										      [
                            ([mi, mp]) => { return mi-mp },
                            ([min, mpl]) => { return min+mpl },
                            ([mr, mi]) => { return mr*mi }
                          ]),
  'm_prop' : new Property('m_prop', [ ['m_initial', 'm_final'],
                                      ['m_dot', 't_burnout'],
                                      ['epsilon', 'm_inert'] ],
										      [
                            ([mi, mf]) => { return mi-mf },
                            ([mdot, tb]) => { return mdot*tb },
                            ([eps, min]) => { return (1-eps)*min/eps }
                          ]),
  'm_inert' : new Property('m_inert', [ ['m_final', 'm_payload'],
                                        ['epsilon', 'm_prop'],
                                        ['lambda', 'm_payload'] ],
										      [
                            ([mf, mpl]) => { return mf-mpl },
                            ([eps, mp]) => { return eps*mp/(1-eps) },
                            ([lam, mpl]) => { return (1-lam)*mpl/lam }
                          ]),
  'm_payload' : new Property('m_payload', [ ['m_final', 'm_inert'],
                                            ['lambda', 'm_inert'] ],
                          [
                            ([mf, min]) => { return mf-min },
                            ([lam, min]) => { return lam*min/(1-lam) },
                          ]),
  'epsilon' : new Property('epsilon', [ ['zeta'],
                                        ['m_inert', 'm_payload'] ],
                          [
                            ([z]) => { return 1-z },
                            ([min, mpl]) => { return min/(min+mpl) },
                          ]),
  'zeta' : new Property('zeta', [ ['epsilon'] ],
                          [
                            ([eps]) => { return 1-eps },
                          ]),
  'lambda' : new Property('lambda', [ ['m_payload', 'm_inert'] ],
                          [
                            ([mpl,min]) => { return mpl/(mpl+min) },
                          ]),
  'MR' : new Property('MR', [ ['R'],['m_final', 'm_inital'] ],
                          [
                            ([r]) => { return 1/r },
                            ([mf,mi]) => { return mf/mi },
                          ]),
  'R' : new Property('R', [ ['MR'],['m_initial', 'm_final'] ],
                          [
                            ([mr]) => { return 1/mr },
                            ([mi,mf]) => { return mi/mf },
                          ]),
  't_burnout' : new Property('t_burnout', [ ['m_prop', 'm_dot'],
                           ['Ce', 'm_prop', 'm_final', 'a_max'],
                           ['Isp', 'R', 'v_burnout'],
                           ['Ce', 'h_burnout', 'R']],
                          [
                            ([mp,mdot]) => { return mp/mdot },
                            ([ce,mp,mf,amax]) => { return ce*mp/(mf*(amax+g)) },
                            ([isp,r,vb]) => { return isp*Math.log(r)-vb/g },
                            ([ce,hb,r]) => {
                              let a = -0.5*g;
                              let b = ce - ce*Math.log(r)/(r-1);
                              return positiveQuadratic(a,b,-hb);
                            }
                          ]),
  'v_burnout' : new Property('v_burnout', [ ['Ce', 'R', 't_burnout'],
                                            ['h_max', 'h_burnout'],
                                            ['Ce', 'h_burnout', 'R'] ],
                          [
                            ([ce,r,tb]) => { return ce*Math.log(r)-g*tb },
                            ([hmax,hb]) => { return Math.sqrt(2*g*(hmax-hb)) },
                          ]),
  'h_burnout' : new Property('h_burnout', [ ['h_max', 'v_burnout'],
                                            ['Ce', 't_burnout', 'R']],
                          [
                            ([hmax,vb]) => { return hmax-(vb*vb)/(2*g) },
                            ([ce,tb,r]) => {
                              return -ce*tb*Math.log(r)/(r-1)+ce*tb-0.5*g*tb*tb
                            },
                          ]),
  'h_max' : new Property('h_max', [ ['h_burnout', 'v_burnout'] ],
                          [
                            ([hb,vb]) => { return hb+(vb*vb)/(2*g) },
                          ]),

}

function positiveQuadratic(a,b,c) {
  let root = b*b - 4*a*c;
  if (root < 0) return null;
  root = Math.sqrt(root);
  let x1 = -0.5*b/a + 0.5*root/a;
  let x2 = -0.5*b/a - 0.5*root/a;
  x1 = Math.max(x1,x2);
  if (x1 < 0) return null;
  return x1;
}
