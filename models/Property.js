class Property {

  constructor(name, vars, equations) {
    this.name = name;
    this.value = null;
    // Property depends on these variables
    // Each set of variables is used in a particular equation
    // E.g. Thrust = f(Ce,m_dot)
    //  and Thrust = f(m_final, a_max)
    //  therefore vars = [['Ce','m_dot'],['m_final','a_max']]
    this.vars = vars;
    this.f = equations; // Functions used to solve Property using vars
                        // E.g. f(Ce, m_dot) = Ce*m_dot;
                        //   therefore f[0] = (a,b)=>{return a*b};
  }
  set(val) {
    this.value = val;
  }
  solve(params) {
    // Check if it's possible to solve
    // console.log(this.name, this.f, this.vars);
    let solvable;
    let vals;
    let i; // Index of the function we'll use to solve it
    for(i = 0; i < this.vars.length; i++) {
      vals = [];
      solvable = true;
      for(var j = 0; j < this.vars[i].length; j++) {
        solvable &= (params[this.vars[i][j]] != null);
        vals.push(params[this.vars[i][j]]);
      }
      if (solvable) break;
    }
    if (!solvable) return false;

    // Solve
    return this.f[i](vals);
  }
}
