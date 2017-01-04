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