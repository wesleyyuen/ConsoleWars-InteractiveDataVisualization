import { dropdownGenreWidget } from "./widgets/dropdown-genre.js";
import { sliderScoreWidget } from "./widgets/slider-score.js";
import { dropdownScoreWidget } from "./widgets/dropdown-score.js";
import { scentedYearView } from "./widgets/scented-year.js";

export default class WidgetPane {
	constructor(_config, mainView) {
		this.config = {
			parentElement: _config.parentElement,
			containerWidth: _config.containerWidth || 400,
			containerHeight: _config.containerHeight || 400,
			margin: _config.margin || {
				top: 10,
				bottom: 10,
				right: 10,
				left: 10,
			},
		};

		this.genreList = [];
		this.yearList = [];
		this.mainView = mainView;
		this.scoreData = {};
		this.data = [];
	}

	initVis() {
		let vis = this;

		vis.div = d3
			.select(vis.config.parentElement)
			.attr("width", vis.config.containerWidth)
			.attr("height", vis.config.containerHeight);

		// Add a dropdown to filter by game genre to wiget pane
		vis.dropdownGenreWidget = vis.div
			.insert("div", ".header.score")
			.attr("id", "dropdown")
			.attr("class", "dropdown");

		// Add a dropdown to select game score type to display as circle colors
		vis.dropdownScoreWidget = vis.div.insert("div", ".header.year").attr("class", "dropdown");

		// Add to wiget pane a scented widget for selecting years of game release
		vis.scentedYearView = vis.div.select("#date-chart").append("svg").attr("id", "hist-svg");

		d3.select(".header.year")
			.append("text")
			.attr("class", "year-range-text")
			.text(`${vis.selectedYearRange[0]} ~ ${vis.selectedYearRange[1]}`);

		vis.render();
	}

	render() {
		let vis = this;

		// SELECT GAMES BY GENRE
		vis.dropdownGenreWidget.call(dropdownGenreWidget, {
			options: vis.genreList,
			onOptionSelected: (option) => {
				vis.selectedGenre = option;
				vis.mainView.update();
			},
			selectedGenre: vis.selectedGenre || vis.genreList[0],
		});

		// SELECT SCORE RANGE FOR USER AND CRITIC SCORE
		_.map(_.keys(vis.scoreData), (type) => {
			vis.div.call(sliderScoreWidget, {
				scoreData: vis.scoreData,
				scoreType: type,
				onScoreDataUpdate: (newScores) => {
					vis.scoreData[type].default = newScores;
				},
				updateMainView: () => vis.mainView.update(),
			});
		});

		// SELECT DISPLAYED SCORE TYPE
		vis.dropdownScoreWidget.call(dropdownScoreWidget, {
			options: _.map(_.values(vis.scoreData), "name"),
			onOptionSelected: (option) => {
				vis.selectedOption = option;
				vis.mainView.handleColor(option);
			},
			selectedOption: vis.selectedOption,
		});

		// SELECT GAMES BY RELEASE YEAR
		vis.scentedYearView.call(scentedYearView, {
			data: vis.data,
			defaultYearRange: vis.selectedYearRange,
			totalRange: [vis.yearList[0], vis.yearList[vis.yearList.length - 1]],
			onSelectedYearRangeChanged: (range) => {
				d3.select(".year-range-text").text(`${range[0]} ~ ${range[1]}`);
				vis.selectedYearRange = range;
				vis.mainView.update();
			},
		});
	}

	setDefaults(defaults, metadata) {
		let vis = this;

		vis.selectedGenre = defaults.selectedGenre;
		vis.selectedYearRange = defaults.selectedYearRange;
		vis.selectedOption = defaults.selectedOption;
		vis.scoreData = {
			critics: {
				name: "Critics", // for dropdown
				default: defaults.selectedCriticScoreRange,
				all: [metadata[0], metadata[1]],
				color: d3.interpolateBlues,
			},
			users: {
				name: "Users", // for dropdown
				default: defaults.selectedUserScoreRange,
				all: [metadata[2], metadata[3]],
				color: d3.interpolateReds,
			},
			diff: {
				name: "Differences", // for dropdown
				default: defaults.selectedDiffScoreRange,
				all: [metadata[4], metadata[5]],
				color: d3.interpolateRdBu,
			},
		};
	}
}
