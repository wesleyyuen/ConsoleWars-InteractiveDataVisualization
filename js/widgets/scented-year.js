/* Design inspired by https://bl.ocks.org/officeofjane/f132634f67b114815ba686484f9f7a77 */

export const scentedYearView = (selection, props) => {
	const { data, defaultYearRange, totalRange, onSelectedYearRangeChanged } = props;

	const width = 500;
	const height = 300;
	const margin = { top: 10, right: 10, bottom: 10, left: 10 };
	const histHeight = height / 3;

	// x scale for years of release
	const x = d3.scaleLinear().domain(totalRange).range([0, width]);
	const xAxis = d3.axisBottom().scale(x).tickFormat(d3.format("d"));
	const getYear = (val) => Math.round(x.invert(val));
	// y scale for count of games
	const y = d3.scaleLinear().range([histHeight, 0]);
	// color scale to encode number of games in each year bin
	const colorScale = d3.scaleSequential(d3.interpolateGreys).domain([0, 2000]);

	// set parameters for histogram
	const histogram = d3
		.histogram()
		.value((d) => d.year)
		.domain(x.domain());

	const hist = selection
		.append("g")
		.attr("class", "histogram")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	const bins = histogram(data);
	y.domain([0, d3.max(bins, (d) => d.length)]);

	const bar = hist
		.selectAll(".bar")
		.data(bins)
		.enter()
		.append("g")
		.attr("class", "bar")
		.attr("transform", (d) => "translate(" + x(d.x0) + "," + y(d.length) + ")");

	bar.append("rect")
		.attr("class", "bar")
		.attr("x", 1)
		.attr("width", (d) => x(d.x1) - x(d.x0) - 1)
		.attr("height", (d) => histHeight - y(d.length))
		.attr("fill", (d) => colorScale(d.length));

	// text to display count of games per bin on top of each rect/bar
	bar.append("text")
		.attr("dy", ".75em")
		.attr("y", "6")
		.attr("x", (d) => (x(d.x1) - x(d.x0)) / 2)
		.attr("text-anchor", "middle")
		.text((d, i) => {
			if (d.length > 30) {
				return d.length;
			}
		})
		.style("fill", "white");

	hist.append("g").attr("class", "slider-labels").attr("transform", "translate(0, 120)").call(xAxis);

	// make a copy so as to not modify original data
	const dataset = data;

	// add a year slider
	const slider = selection
		.append("g")
		.attr("class", "slider")
		.attr("transform", "translate(" + margin.left + "," + (margin.top + histHeight + 5) + ")");

	slider
		.append("line")
		.attr("class", "track")
		.attr("x1", x.range()[0])
		.attr("x2", x.range()[1])
		.select(function () {
			return this.parentNode.appendChild(this.cloneNode(true));
		})
		.attr("class", "track-inset")
		.select(function () {
			return this.parentNode.appendChild(this.cloneNode(true));
		})
		.attr("class", "track-overlay");

	const startHandle = slider
		.insert("ellipse", ".track-overlay")
		.attr("class", "left handle")
		.attr("rx", 9)
		.attr("ry", 9)
		.attr("cx", x(defaultYearRange[0]))
		.style("fill", "rgb(250, 121, 0)");

	const endHandle = slider
		.insert("ellipse", ".track-overlay")
		.attr("class", "right handle")
		.attr("rx", 9)
		.attr("ry", 9)
		.attr("cx", x(defaultYearRange[1]))
		.style("fill", "rgb(250, 121, 0)");

	let xloc = 0; // x position in pixels
	let dx = 0; // change in x

	slider.call(
		d3
			.drag()
			.on("start.interrupt", function () {
				slider.interrupt();
			})
			.on("start drag end", function () {
				if (d3.event.dx != 0) dx = d3.event.dx; // last moved distance
				if (d3.event.type == "end") {
					xloc = d3.event.x;
					// handle bounds better (min/max)
					if (xloc < x(totalRange[0])) xloc = x(totalRange[0]);
					if (xloc > x(totalRange[1])) xloc = x(totalRange[1]);

					const leftX = $(".left.handle").attr("cx");
					const rightX = $(".right.handle").attr("cx");

					// define conditions of brush movement
					const rightMovedRight = xloc > rightX && dx > 0;
					const leftMovedRight = xloc > leftX && xloc < rightX && dx > 0;
					const leftMovedLeft = xloc < leftX && dx < 0;
					const rightMovedLeft = xloc > leftX && xloc < rightX && dx < 0;

					if (rightMovedRight || rightMovedLeft) {
						if (dx == -1) xloc = x(getYear(xloc) - 1);
						updateEndRange(xloc, leftX);
					} else if (leftMovedRight || leftMovedLeft) {
						if (dx == 1) xloc = x(getYear(xloc) + 1);
						updateStartRange(xloc, rightX);
					}

					dx = 0;
				}
			})
	);

	function updateStartRange(newLeftX, oldRightX) {
		const updatedStartYear = getYear(newLeftX);
		// move left handle to new position
		startHandle.attr("cx", x(updatedStartYear));
		// right handle position stays unchanged
		const endYear = getYear(oldRightX);
		const newRange = [updatedStartYear, endYear];

		// callback to update range
		onSelectedYearRangeChanged(newRange);

		// highlight label color
		d3.selectAll(".slider-labels")
			.selectAll(".tick")
			.select("text")
			.attr("stroke", (d) => {
				if (d == updatedStartYear || d == endYear) {
					return "white";
				}
			});
	}

	function updateEndRange(newRightX, oldLeftX) {
		const updatedEndYear = getYear(newRightX);
		// move right handle to new position
		endHandle.attr("cx", x(updatedEndYear));
		// left handle position stays unchanged
		const startYear = getYear(oldLeftX);
		const newRange = [startYear, updatedEndYear];

		// callback to update range
		onSelectedYearRangeChanged(newRange);

		// highlight label color
		d3.selectAll(".slider-labels")
			.selectAll(".tick")
			.select("text")
			.attr("stroke", (d) => {
				if (d == startYear || d == updatedEndYear) {
					return "white";
				}
			});
	}
};
