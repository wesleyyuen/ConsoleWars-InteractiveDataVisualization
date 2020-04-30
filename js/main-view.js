export default class MainView {
	constructor(_config) {
		this.config = {
			parentElement: _config.parentElement,
			containerWidth: _config.containerWidth || 1000,
			containerHeight: _config.containerHeight || 600,
			margin: _config.margin || {
				top: 10,
				bottom: 10,
				right: 10,
				left: 10,
			},
		};

		this.sony_data = [];
		this.microsoft_data = [];
		this.nintendo_data = [];
		this.pc_data = [];
	}

	initVis() {
		let vis = this;

		vis.svg = d3.select(vis.config.parentElement).attr("width", "100%").attr("height", 900);

		vis.sony_group = vis.svg
			.append("g")
			.attr("class", "sony")
			.attr("x", document.body.offsetWidth / 4)
			.attr("y", document.body.offsetHeight / 4);
		vis.microsoft_group = vis.svg
			.append("g")
			.attr("class", "microsoft")
			.attr("x", (2 * document.body.offsetWidth) / 4)
			.attr("y", document.body.offsetHeight / 4);
		vis.nintendo_group = vis.svg
			.append("g")
			.attr("class", "nintendo")
			.attr("x", document.body.offsetWidth / 4)
			.attr("y", (2 * document.body.offsetHeight) / 4 + 100);
		vis.pc_group = vis.svg
			.append("g")
			.attr("class", "pc")
			.attr("x", (2 * document.body.offsetWidth) / 4)
			.attr("y", (2 * document.body.offsetHeight) / 4 + 100);

		vis.labelCluster(); // add label text for clusters
		vis.padding = 1.5; // padding within cluster
		vis.selectedGame = "";

		// Tooltip Setup
		vis.div = d3
			.select("body")
			.append("div")
			.attr("class", "tooltip")
			.attr("style", "position: fixed; opacity: 0;");
		vis.widthCenterPercent = 35;

		vis.currentWidth = document.getElementById("mainview").offsetWidth;
		vis.currentHeight = document.getElementById("mainview").offsetHeight;

		// Cetner the clusters on window resize
		window.visualViewport.addEventListener("resize", () => {
			vis.currentWidth = document.getElementById("mainview").offsetWidth;
			vis.currentHeight = document.getElementById("mainview").offsetHeight;
			vis.initForce();
		});

		vis.circleRadius = d3.scaleLinear().domain([vis.salesMin, vis.salesMax]).range([10, 150]);

		// Color scales
		vis.critics_colorScaleRange = d3.schemeBlues[9];
		vis.critics_colorScale = d3
			.scaleQuantile()
			.domain([vis.criticMin, vis.criticMax])
			.range(vis.critics_colorScaleRange);

		vis.users_colorScaleRange = d3.schemeReds[9];
		vis.users_colorScale = d3.scaleQuantile().domain([vis.userMin, vis.userMax]).range(vis.users_colorScaleRange);
		vis.diff_colorScale = d3.scaleSequential(d3.interpolateRdBu).domain([vis.maxScoreDiff, vis.minScoreDiff]);

		vis.initSequentialLegend();		// Create legend for score difference
		vis.update();
	}

	labelCluster() {
		this.sony_group.append("text")
			.attr("x", this.sony_group.attr("x") - 200)
			.attr("y", 30)
			.attr("font-size", "30px")
			.text("Sony");

		this.microsoft_group.append("text")
			.attr("x", this.microsoft_group.attr("x") - 200)
			.attr("y", 30)
			.attr("font-size", "30px")
			.text("Microsoft");

		this.nintendo_group.append("text")
			.attr("x", this.nintendo_group.attr("x") - 200)
			.attr("y", document.body.offsetHeight - 200)
			.attr("font-size", "30px")
			.text("Nintendo");

		this.pc_group.append("text")
			.attr("x", this.pc_group.attr("x") - 150)
			.attr("y", document.body.offsetHeight - 200)
			.attr("font-size", "30px")
			.text("PC");
	}

	filterGame(gameArr) {
		if (gameArr.length == 0) return gameArr;
		return _.filter(
			gameArr,
			(game) =>
				game.genre == this.widgetPane.selectedGenre &&
				_.includes(
					_.range(this.widgetPane.selectedYearRange[0], this.widgetPane.selectedYearRange[1]),
					game.year
				) &&
				_.includes(
					_.range(
						this.widgetPane.scoreData["critics"].default[0],
						this.widgetPane.scoreData["critics"].default[1]
					),
					game.crit_score
				) &&
				_.includes(
					_.range(
						this.widgetPane.scoreData["users"].default[0],
						this.widgetPane.scoreData["users"].default[1]
					),
					game.user_score
				)
		);
	}

	update() {
		let vis = this;

		vis.filteredData = {
			sony: this.filterGame(this.sony_data),
			microsoft: this.filterGame(this.microsoft_data),
			nintendo: this.filterGame(this.nintendo_data),
			pc: this.filterGame(this.pc_data),
		};

		vis.filteredDataArray = _.flatten(_.values(this.filteredData));

		vis.render();
		vis.initForce();	// recalculate force simulation
	}

	initForce() {
		const allCircles = d3.selectAll("circle");
		this.force = d3
			.forceSimulation(this.filteredDataArray)
			.force("center", d3.forceCenter(this.currentWidth / 2 - 10, this.currentHeight / 2 - 100))
			.force("cluster", this.cluster().strength(0.7))
			.force("collide", d3.forceCollide((d) => this.circleRadius(d.global_sales) + this.padding).strength(0.7))
			.force("charge", d3.forceManyBody().strength(-3))
			.on("tick", function () {
				allCircles.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
			});
	}

	render() {
		let vis = this;

		vis.sony_circles = vis.sony_group	// Sony Cluster
			.selectAll(".sony-nodes")
			.data(vis.filteredData["sony"])
			.join("circle")
			.transition()
			.attr("class", "sony-nodes")
			.attr("id", (d) => "sony" + d.id_num)
			.attr("r", (d) => vis.circleRadius(d.global_sales))
			.attr("cx", (d) => +vis.sony_group.attr("x") + Math.random() * vis.padding)
			.attr("cy", (d) => +vis.sony_group.attr("y") + Math.random() * vis.padding)
			.attr("cluster", "Sony");

		vis.microsoft_circles = vis.microsoft_group		// Microsoft Cluster
			.selectAll(".microsoft-nodes")
			.data(vis.filteredData["microsoft"])
			.join("circle")
			.transition()
			.attr("class", "microsoft-nodes")
			.attr("id", (d) => "microsoft" + d.id_num)
			.attr("r", (d) => vis.circleRadius(d.global_sales))
			.attr("cx", (d) => +vis.microsoft_group.attr("x") + Math.random() * vis.padding)
			.attr("cy", (d) => +vis.microsoft_group.attr("y") + Math.random() * vis.padding)
			.attr("cluster", "Microsoft");

		vis.nintendo_circles = vis.nintendo_group		// Nintendo Cluster
			.selectAll(".nintendo-nodes")
			.data(vis.filteredData["nintendo"])
			.join("circle")
			.transition()
			.attr("class", "nintendo-nodes")
			.attr("id", (d) => "nintendo" + d.id_num)
			.attr("r", (d) => vis.circleRadius(d.global_sales))
			.attr("cx", (d) => +vis.nintendo_group.attr("x") + Math.random() * vis.padding)
			.attr("cy", (d) => +vis.nintendo_group.attr("y") + Math.random() * vis.padding)
			.attr("cluster", "nintendo");

		vis.pc_circles = vis.pc_group					// PC Cluster
			.selectAll(".pc-nodes")
			.data(vis.filteredData["pc"])
			.join("circle")
			.transition()
			.attr("class", "pc-nodes")
			.attr("id", (d) => "pc" + d.id_num)
			.attr("r", (d) => vis.circleRadius(d.global_sales))
			.attr("cx", (d) => +vis.pc_group.attr("x") + Math.random() * vis.padding)
			.attr("cy", (d) => +vis.pc_group.attr("y") + Math.random() * vis.padding)
			.attr("cluster", "pc");

		vis.handleSelection();
		vis.handleColor(vis.widgetPane.selectedOption);
	}

	handleSelection() {
		let vis = this;
		vis.svg.selectAll("circle")
			.on("mouseover", (d) => {
				const localSelected = d.console_company + d.id_num;

				// highlight selected games
				d3.select("#" + localSelected)
					.style("stroke", "#FF4F00")
					.style("stroke-width", "3px");
				// highlight same game in other clusters
				vis.getRelatedIDs(d.name, d.console_company).forEach((d) => {
					d3.select("#" + d)
						.style("stroke", "#FF7538")
						.style("stroke-width", "3px");
				});

				// Show Game Info in Tooltips
				// prettier-ignore
				d3.select(".tooltip")
					.style("opacity", 1)
					.style("background", (d) => {
						return vis.widgetPane.selectedOption == "Critics" ?
							vis.critics_colorScaleRange[8] :
							vis.users_colorScaleRange[8]
					})
					.html(
						"<b>" + d.name + "</b> (" + d.year + ")" +
						"<br/>" + d.platform + "  |  " + d.publisher +
						"<br/> Global Sales: " +
						d.global_sales + "M"
					)
					.style("top", vis.currentHeight / 2 + "px")
					.style("left", vis.currentWidth + 30 + d3.select(".tooltip").style("width").replace("px", "") / 2 + "px");

				vis.selectedGame = localSelected;
			})
			.on("click", (d) => {
				// Show Donut Chart and hide tooltips
				if (d3.select("#pieChart").select("*").empty()) {
					vis.initDonut(d);
					d3.select("#pieChart")
						.style("top", vis.currentHeight / 3 + "px")
						.style("left", vis.currentWidth + 50 + "px");
					d3.select(".tooltip").style("opacity", 0);
				} else { // Hide Donut Chart and show tooltips
					d3.select("#pieChart").selectAll("*").remove();
					d3.select(".tooltip").style("opacity", 1);
				}
			})
			.on("mouseout", (d) => {
				// Unhighlight the game
				d3.select("#" + vis.selectedGame)
					.style("stroke", "black")
					.style("stroke-width", "1px");
				vis.getRelatedIDs(d.name, d.console_company).forEach((d) => {
					d3.select("#" + d)
						.style("stroke", "black")
						.style("stroke-width", "1px");
				});

				d3.select(".tooltip").style("opacity", 0); // Hide tooltips

				d3.select("#pieChart").selectAll("*").remove();

				vis.selectedGame = "";
			});
	}

	getRelatedIDs(name, company) {
		let relatedIDs = [];
		const s_result = this.sony_data.find((d) => d.name === name);
		const m_result = this.microsoft_data.find((d) => d.name === name);
		const n_result = this.nintendo_data.find((d) => d.name === name);
		const p_result = this.pc_data.find((d) => d.name === name);

		if (s_result !== undefined && s_result.console_company !== company)
			relatedIDs.push(s_result.console_company + s_result.id_num);
		if (m_result !== undefined && m_result.console_company !== company)
			relatedIDs.push(m_result.console_company + m_result.id_num);
		if (n_result !== undefined && n_result.console_company !== company)
			relatedIDs.push(n_result.console_company + n_result.id_num);
		if (p_result !== undefined && p_result.console_company !== company)
			relatedIDs.push(p_result.console_company + p_result.id_num);

		return relatedIDs;
	}

	handleColor(selectedOption) {
		let vis = this;

		d3.selectAll("circle")
			.attr("stroke-width", "1px")
			.attr("stroke", "black")
			.attr("fill", (d) => {
				return selectedOption == "Critics"
					? vis.critics_colorScale(d.crit_score)
					: selectedOption == "Users"
						? vis.users_colorScale(d.user_score)
						: vis.diff_colorScale(d.score_diff);
			});

		d3.select(".tooltip").style("background", (d) => {
			return selectedOption == "Critics" ? vis.critics_colorScaleRange[8] : vis.users_colorScaleRange[8];
		});

		if (selectedOption == "Differences") d3.select("#legend").style("opacity", 1);
		else d3.select("#legend").style("opacity", 0);
	}

	/*
	Below are borrowed functions
	*/
	// from http://bl.ocks.org/syntagmatic/e8ccca52559796be775553b467593a9f
	initSequentialLegend() {
		const vis = this,
			legendheight = 200,
			legendwidth = 80,
			margin = { top: 10, right: 60, bottom: 10, left: 5 };

		var canvas = d3
			.select("#legend")
			.style("height", legendheight + "px")
			.style("width", legendwidth + "px")
			.style("position", "absolute")
			.style("top", margin.top + "px")
			.style("left", margin.left + "px")
			.append("canvas")
			.attr("height", legendheight - margin.top - margin.bottom)
			.attr("width", 1)
			.style("height", legendheight - margin.top - margin.bottom + "px")
			.style("width", legendwidth - margin.left - margin.right + "px")
			.style("border", "1px solid #000")
			.node();

		var legendscale = d3
			.scaleLinear()
			.range([1, legendheight - margin.top - margin.bottom])
			.domain(vis.diff_colorScale.domain());

		const ctx = canvas.getContext("2d");
		d3.range(legendheight).forEach(function (i) {
			ctx.fillStyle = vis.diff_colorScale(legendscale.invert(i));
			ctx.fillRect(0, i, 1, 1);
		});

		const legendaxis = d3
			.axisRight()
			.scale(legendscale)
			.tickSize(6)
			.ticks(8)
			.tickFormat((d) => (d == 60 ? d + " (User Score - Critics Score)" : d));

		d3.select("#legend")
			.style("pointer-events", "none")
			.append("svg")
			.attr("height", legendheight + 30 + "px")
			.attr("width", legendwidth + 150 + "px")
			.style("position", "absolute")
			.style("top", "-10px")
			.append("g")
			.attr("class", "axis")
			.attr(
				"transform",
				"translate(" + (legendwidth - margin.left - margin.right - 15) + "," + (margin.top - 1) + ")"
			)
			.style("color", "black")
			.style("font-size", "15px")
			.call(legendaxis);
	}

	// function generated by http://d3pie.org/ and modified
	initDonut(d) {	// Initialize Donut Chart
		const na_sales = +d.na_sales == 0 ? 0.0001 : +d.na_sales;
		const eu_sales = +d.eu_sales == 0 ? 0.0001 : +d.eu_sales;
		const jp_sales = +d.jp_sales == 0 ? 0.0001 : +d.jp_sales;
		const other_sales = +d.other_sales == 0 ? 0.0001 : +d.other_sales;
		const pie = new d3pie("pieChart", {
			header: {
				title: {
					text: "Sales By Region",
					fontSize: 15,
				},
				location: "pie-center"
			},
			size: {
				canvasWidth: 380,
				canvasHeight: 310,
				pieInnerRadius: "82%",
				pieOuterRadius: "55%",
			},
			data: {
				sortOrder: "label-desc",
				content: [
					{
						label: "North America",
						value: na_sales,
						color: "#C0C0C0",
					},
					{
						label: "Europe",
						value: eu_sales,
						color: "#A9A9A9",
					},
					{
						label: "Japan",
						value: jp_sales,
						color: "#808080",
					},
					{
						label: "Others",
						value: other_sales,
						color: "#696969",
					},
				],
			},
			labels: {
				outer: {
					format: "label-percentage1",
					pieDistance: 15,
				},
				inner: {
					format: "none",
				},
				mainLabel: {
					fontSize: 13,
				},
				percentage: {
					color: "#999999",
					fontSize: 13,
					decimalPlaces: 1,
				},
				lines: {
					enabled: true,
					color: "#777777",
				},
				truncation: {
					enabled: true,
				},
			},
			effects: {
				load: {
					speed: 100,
				},
			},
			misc: {
				colors: {
					background: "#ececec",
					segmentStroke: "#000000",
				},
			},
		});

		d3.select("#pieChart").select("svg").append("text")
			.attr("x", 15)
			.attr("y", 30)
			.style("color", "black")
			.text(d.name);
	}

	// Move d to be adjacent to the cluster node.
	// from: https://bl.ocks.org/ericsoco/cd0c38a20141e997e926592264067db3
	cluster() {
		let vis = this;
		var nodes,
			strength = 0.1;

		function force(alpha) {
			alpha *= strength * alpha; // scale + curve alpha value
			nodes.forEach((d) => {
				const group = d3.select("." + d.console_company);
				var cluster_x = group.attr("x"),
					cluster_y = group.attr("y");

				let x = d.x - cluster_x,
					y = d.y - cluster_y,
					l = Math.sqrt(x * x + y * y),
					r = vis.circleRadius(d.global_sales);

				if (l != r) {
					l = ((l - r) / l) * alpha;
					d.x -= x *= l;
					d.y -= y *= l;
					cluster_x += x;
					cluster_y += y;
				}
			});
		}

		force.initialize = function (_) {
			nodes = _;
		};

		force.strength = (_) => {
			strength = _ == null ? strength : _;
			return force;
		};

		return force;
	}
}
