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
		minSecs: '%M:%S',
		dopedPercentage: '.0%'
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
			.attr('r', '7')
			.attr('cx', function(d) {
				return that.chart.x(d['Diff'].getTime());
			})
			.attr('cy', function(d) {
				return that.chart.y(d['Place']);
			});
}

MyScatterplotGraph.prototype.setupBackgroundText = function() {
	var that = this;
	this.chart.bgText = this.chart.svg
		.append('g')
			.attr('class', 'bg-text')
			.attr('transform', 'translate(' + this.props.width / 2.5  + ',' + this.props.height / 1.7 + ')');

	this.chart.bgText.append('text')
		.attr('class', 'bg-text-headline');
	this.chart.bgText.append('text')
		.attr('class', 'bg-text-question')
		.attr('y', 60);
	this.chart.bgText.append('text')
		.attr('class', 'bg-text-answer')
		.attr('y', 120);
}

MyScatterplotGraph.prototype.setupAuthorDrivenNarrative = function() {
	var that = this;
	var dopedCounter = 0;
	var authorDrivenTimeout = null;

	d3.select('.bg-text-headline')
		.text('35 Fastest Times up Alpe D\'Huez');
	d3.selectAll('circle')
		.transition()
		.delay(function(d, i) {
			return i * 200;
		})
		.style('opacity', 1)
		.on('end', function(d, i) {
			if (i === 34) {
				authorDrivenTimeout = window.setTimeout(function() {
					d3.select('.bg-text-question')
					.text('Performed by Cyclist with Doping Allegations:');
					d3.selectAll('circle')
						.transition()
						.duration(1000)
						.delay(function(d, i) {
							return 400 * i;
						})
						.attr('class', function(d) {
							if (d['Doping'] !== '') {
								return 'dope'
							}
							else {
								return 'no-dope'
							}
						})
						.style('opacity', 1)
						.on('start', function(d) {
							if (d['Doping'] !== '') {
								dopedCounter++;
								d3.select('.bg-text-answer')
									.text(d3.format(that.props.formats.dopedPercentage)(dopedCounter / 35));
							}
						})
						.on('end', function(d, i) {
							if (i === 34) {
								window.clearTimeout(authorDrivenTimeout);
								authorDrivenTimeout = null;
								d3.select('.bg-text')
									.style('display', 'none');
								that.startUserDrivenNarrative();
							}
						});
				}, 2000);
			}
		});
}

MyScatterplotGraph.prototype.startUserDrivenNarrative = function() {
	var that = this;
	this.chart.tooltip = d3.select('body')
	.insert('div', ':first-child')
		.attr('class', 'tooltip');

	d3.selectAll('circle')
	.on('mouseover', function(d, i, data) {

		// Hover effect
		d3.select(this)
			.attr('class', function(d) {
				if (d3.select(this).attr('class') === 'dope') {
					return 'dope-selected';
				}
				else {
					return 'no-dope-selected';
				}
			});

		// Tooltip placement
		var xCoord = d3.event.pageX + 20;
		var yCoord = d3.event.pageY - 20;
		if (yCoord > 480) {
			yCoord -= 100;
		}
		if (data[i]['cx']['baseVal']['value'] > 770) {
			var diff = that.props.width + that.props.margin.left + that.props.margin.right - data[i]['cx']['baseVal']['value'];
			xCoord -= 320 - diff;
			yCoord += 50;
		}

		var html = '<h4>' + d['Name'] + ' (' + d['Nationality'] + ')</h4>';
		html += '<p>Time: 0:' + d['Time'] + ' (' + d['Year'] + ')';
		html += '<p>' + (d['Doping'] === '' ? 'No doping allegations' : d['Doping']) + '</p>';
		
		that.chart.tooltip
			.attr('class', function() {
				if (d['Doping'] === '') {
					return 'tooltip tooltip-no-dope'
				}
				else {
					return 'tooltip tooltip-dope'
				}
			})
			.html(html)
			.style('left', xCoord + 'px')
			.style('top', yCoord + 'px')
			.style('display', 'block');
	})
	.on('mouseleave', function(d) {
		// Undo hover effect		
		d3.select(this)
			.attr('class', function(d) {
				if (d3.select(this).attr('class') === 'dope-selected') {
					return 'dope';
				}
				else {
					return 'no-dope';
				}
			});

		// Hide tooltip
		that.chart.tooltip
			.style('display', 'none');
	});
}