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
		}
	});
}
function MyHelper() { }


function MyScatterplotGraph(data) {
	this.chart = {};
	this.data = data;
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
		.domain([this.data.length, 1]);

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