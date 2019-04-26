// Created with the help of:
// https://blog.webkid.io/responsive-chart-usability-d3/
// https://medium.freecodecamp.org/learn-to-create-a-line-chart-using-d3-js-4f43f1ee716b
// https://bl.ocks.org/shimizu/914c769f05f1b2e1d09428c7eedd7f8a

class Plot {

  constructor() {
    this.id = "#plot";
    this.margin = { top: 10, right: 30, bottom: 20, left: 30 };
    this.updateDimensions();
    this.svg = d3.select('#plot').append('svg')
      .attr("width", this.svgWidth)
      .attr("height", this.svgHeight);
    this.g = this.svg.append("g")
       .attr("transform",
          "translate(" + this.margin.left + "," + this.margin.top + ")"
       );

    this.updateScale();

    this.line = d3.line()
       .x(function(d) { return this.xScale(d.time)})
       .y(function(d) { return this.yScale(d.velocity)})

    this.xAxis = this.g.append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .attr("class", "x axis")
      .attr("stroke", "#fff")
      .call(this.xAxisCall)
      .append("text")
      .attr("fill", "#fff")
      .attr("class", "x label")
      .attr("x", this.width-30)
      .attr("dx", "1.1em")
      .attr("y", -12)
      .attr("dy", "0.71em")
      .text("Time (s)");


    this.yAxis = this.g.append("g")
      .attr("stroke", "#fff")
      .attr("class", "y axis")
      .call(this.yAxisCall)
      .append("text")
      .attr("class", "y label")
      .attr("fill", "#fff")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Velocity (m/s)");

    this.path = this.g.append("path")
  }

  update() {
    this.updateScale();
    let x = this.xScale;
    let y = this.yScale;
    this.line = d3.line()
       .x( d =>{ return this.xScale(d.time)})
       .y( d =>{ return this.yScale(d.velocity)})

    this.svg.select('.x')
            .attr("transform", "translate(0," + this.height + ")")
            .call(this.xAxisCall)

    this.svg.select('.y')
            .call(this.yAxisCall)

    this.path.datum(data)
              .attr("fill", "none")
              .attr("stroke", "steelblue")
              .attr("stroke-linejoin", "round")
              .attr("stroke-linecap", "round")
              .attr("stroke-width", 1.5)
              .attr("d", this.line);
  }

  updateDimensions() {
    this.svgWidth = 500, this.svgHeight = 0.7*this.svgWidth;
    if (window.innerWidth < 600)
      this.svgWidth = window.innerWidth-50, this.svgHeight = 0.7*this.svgWidth;
    this.width = this.svgWidth - this.margin.left - this.margin.right;
    this.height = this.svgHeight - this.margin.top - this.margin.bottom;
    d3.select('svg').attr("width", this.svgWidth)
            .attr("height", this.svgHeight);

  }

  updateScale() {
    this.xScale = d3.scaleLinear().rangeRound([0, this.width]);
    this.yScale = d3.scaleLinear().rangeRound([this.height, 0]);
    this.xAxisCall = d3.axisBottom();
    this.yAxisCall = d3.axisLeft();
    this.yScale.domain([v_min, v_max])
               .range([this.height-(this.margin.top+this.margin.bottom),0])
    this.xScale.domain([0,t])
               .range([0,this.width-(this.margin.top+this.margin.bottom)])
    this.xAxisCall.scale(this.xScale)
    this.yAxisCall.scale(this.yScale)
  }

  clear() {
    $(this.id).html('');
  }

}
