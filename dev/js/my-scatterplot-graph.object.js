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
		.domain([this.data.json.length + 2, 1]);

	var yAxis = d3.axisLeft(this.chart.y)
		.ticks(10)
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
	this.data.timeInterval[1] += 15;
	this.chart.x = d3.scaleTime()
		.range([0, this.props.width])
		.domain([this.helper.createMinSecDate(this.data.timeInterval).getTime(),this.helper.createMinSecDate('00:00').getTime()]);

	var xAxis = d3.axisBottom(this.chart.x)
		.tickFormat(d3.timeFormat(this.props.formats.minSecs))
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

MyScatterplotGraph.prototype.addCircles = function() {
	var that = this;
	this.chart.svg.selectAll('.scatter')
		.data(this.data.json, function(d) {
			var diff = that.helper.calcMinSecAbsDiff(that.data.fastestTime, d['Time'])
			d['Diff'] = that.helper.createMinSecDate(diff);
		})
		.enter()
		.append('circle')
			.attr('class', function(d) {
				if (d['Doping'] !== '') {
					return 'dope'
				}
				else {
					return 'no-dope'
				}
			})
			.attr('r', '7')
			.attr('cx', function(d) {
				return that.chart.x(d['Diff'].getTime());
			})
			.attr('cy', function(d) {
				return that.chart.y(d['Place']);
			});
}