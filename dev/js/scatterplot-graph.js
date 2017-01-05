var bikeRaceDoping = new MyBikeRaceDoping();
function MyBikeRaceDoping() {
	this.data = null;
	this.scatterplot = null;
	
	d3.json('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json', function(error, json) {
		if (error) {
			console.error('Error happened reading JSON data');
		}
		else {
			this.data = json;
			this.scatterplotGraph = new MyScatterplotGraph(this.data);
			this.scatterplotGraph.createChart();
			this.scatterplotGraph.addYAxis();
			this.scatterplotGraph.addXAxis();
		}
	});
}
function MyHelper() { }

/*  createMinSecDate function
    creates Date objects to calculate minutes/seconds 
    expects either:
    - String: two digits format '00:00'
    - Array: containing two elements with minutes and seconds [0, 30]
    Returns:
    Date Object with:
    - constant year, month, days, milliseconds
    - minutes and seconds according to input */
MyHelper.prototype.createMinSecDate = function(stringOrArray) {
  var minSecDate = new Date(2000, 1, 1, 0, 0, 0, 0);
  var mins;
  var secs;
  if (typeof stringOrArray === 'string') {
    mins = stringOrArray.substr(0, 2);
    secs = stringOrArray.substr(3, 2);
  }
  else {
    mins = stringOrArray[0];
    secs = stringOrArray[1];    
  }
  minSecDate.setMinutes(mins,secs, 0);
  return minSecDate;
}

/*  calcminSecAbsDiff function
    Calculates absolute difference in minutes and seconds
    Input:
    - Expects two strings in two digits format '00:00'
    Returns:
    - Two-element array containing [minutes, seconds] */
MyHelper.prototype.calcMinSecAbsDiff = function(string1, string2) {
  var date1 = this.createMinSecDate(string1);
  var date2 = this.createMinSecDate(string2);
  var diff = Math.abs(date1.getTime() - date2.getTime());
  var diffSecs = diff / 1000;
  var diffMins = diffSecs/60;
  diffSecs = diffSecs % 60;
  return [diffMins, diffSecs];
}
function MyScatterplotGraph(json) {
	this.chart = {};
	this.data = {};
	this.data.json = json;
	this.helper = new MyHelper();

	// SVG properties
	this.props = {};
	this.props.margin = {
		top: 20,
		right: 30,
		bottom: 30,
		left: 40
	};
	this.props.width = 1080 - this.props.margin.left - this.props.margin.right;
	this.props.height = 600 - this.props.margin.top - this.props.margin.bottom;

	// D3 data formatting properties
	this.props.formats = {
		minSecs: '%M:%S'
	};
}

MyScatterplotGraph.prototype.createChart = function() {
	this.chart.svg = d3.select('body')
	.append('svg')
		.attr('class', 'scatterplot-graph')
		.attr('width', this.props.width + this.props.margin.left + this.props.margin.right)
		.attr('height', this.props.height + this.props.margin.top + this.props.margin.bottom)
		.append('g')
			.attr('transform', 'translate(' + this.props.margin.left + ',' + this.props.margin.top + ')');
	return this.chart;	
}

MyScatterplotGraph.prototype.addYAxis = function() {
	this.chart.y = d3.scaleLinear()
		.range([this.props.height, 0])
		.domain([1, this.data.json.length]);

	var yAxis = d3.axisLeft(this.chart.y)
		.ticks(12)
		.tickSizeOuter(0);

	this.chart.svg.append('g')
		.attr('class', 'y axis')
		.call(yAxis)
		.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('y', 6)
			.attr('dy', '.71em')
			.style('text-anchor', 'end')
			.text('Rank');
}

MyScatterplotGraph.prototype.addXAxis = function() {
	this.data.fastestTime = d3.min(this.data.json, function(d) {
		return d['Time'];
	});
	this.data.slowestTime = d3.max(this.data.json, function(d) {
		return d['Time'];
	});
	this.data.timeInterval = this.helper.calcMinSecAbsDiff(this.data.fastestTime, this.data.slowestTime);

	this.chart.x = d3.scaleTime()
		.range([0, this.props.width])
		.domain([this.helper.createMinSecDate('00:00').getTime(), this.helper.createMinSecDate(this.data.timeInterval).getTime()]);

	var xAxis = d3.axisBottom(this.chart.x)
		.tickFormat(d3.timeFormat('%M:%S'))
		.tickSizeOuter(0)
		.ticks(10);

	this.chart.svg.append('g')
		.attr('class', 'x axis')
		.attr('transform', 'translate(0,' + this.props.height + ')')
		.call(xAxis)
		.append('text')
			.attr('transform', 'translate(' + this.props.width + ', -15)')
			.style('text-anchor', 'end')
			.text('Difference to Fastest Time'); 
}