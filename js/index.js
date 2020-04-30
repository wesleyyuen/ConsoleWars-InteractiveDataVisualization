import MainView from "./main-view.js";
import { preprocessor } from "./preprocessor.js";
import WidgetPane from "./widget-pane.js";

const mainView = new MainView({ parentElement: "#main" });
const widgetPane = new WidgetPane({ parentElement: "#widgets" }, mainView);

preprocessor.then((processedData) => {
	const { mainViewData, salesMax, salesMin, metadata } = processedData;
	widgetPane.data = _.flatMap(mainViewData);

	mainView.sony_data = mainViewData[0];
	mainView.microsoft_data = mainViewData[1];
	mainView.nintendo_data = mainViewData[2];
	mainView.pc_data = mainViewData[3];
	mainView.others_data = mainViewData[4];
	mainView.salesMax = salesMax;
	mainView.salesMin = salesMin;
	mainView.criticMax = metadata[0];
	mainView.criticMin = metadata[1];
	mainView.userMax = metadata[2];
	mainView.userMin = metadata[3];
	mainView.maxScoreDiff = metadata[4];
	mainView.minScoreDiff = metadata[5];

	widgetPane.genreList = _.uniq(_.map(widgetPane.data, "genre")).sort();
	widgetPane.yearList = _.uniq(_.map(widgetPane.data, "year"))
		.filter((year) => !Number.isNaN(year))
		.sort();

	// Initialize widget pane with hardcoded "default" values
	const defaults = {
		selectedGenre: widgetPane.genreList[8], // Default game genre to show
		selectedYearRange: [2005, 2013], // Default release years of games
		selectedOption: "Critics", // Default game score data
		selectedCriticScoreRange: [40, 70],
		selectedUserScoreRange: [40, 70],
		selectedDiffScoreRange: [40, 70],
	};

	widgetPane.setDefaults(defaults, metadata);
	widgetPane.initVis();

	mainView.widgetPane = widgetPane;
	mainView.initVis();
});
