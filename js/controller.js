import { formatData } from "./controller-data.js";
import GameControllerView from "./game-controller-view.js";

let activeIndex = 0;
let lastIndex = -1;
let sectionNumbers = [0, 1, 2, 3, 4];

let GameViewMicrosoft = new GameControllerView({
	parentElement: "#vis",
	filename: "microsoft.csv",
	type: "microsoft",
	scale: 1,
});
let GameViewSony = new GameControllerView({
	parentElement: "#vis",
	filename: "sony.csv",
	type: "sony",
	scale: 0.8,
});
let GameViewNintendo = new GameControllerView({
	parentElement: "#vis",
	filename: "nintendo.csv",
	type: "nintendo",
	scale: 1,
});
let GameViewPC = new GameControllerView({
	parentElement: "#vis",
	filename: "pc.csv",
	type: "pc",
	scale: 2,
});
let GameViewOther = new GameControllerView({
	parentElement: "#vis",
	filename: "others.csv",
	type: "other",
	scale: 2.5,
});

let indexes = {
	0: GameViewMicrosoft,
	1: GameViewSony,
	2: GameViewNintendo,
	3: GameViewPC,
	4: GameViewOther,
};

const initialize = () => {
	d3.csv("data/games.csv").then((data) => {
		let formattedData = formatData(data);
		// console.log(formattedData)
		let salesData = R.groupBy(R.prop("sales_platform_company"))(R.flatten(formattedData.map((val) => val.sales)));
		let microsoftData = formattedData.filter((x) => x.platform_company == "Microsoft");
		GameViewMicrosoft.data = microsoftData;
		GameViewMicrosoft.salesData = salesData["Microsoft"];
		GameViewMicrosoft.init();

		let sonyData = formattedData.filter((x) => x.platform_company == "Sony");
		GameViewSony.data = sonyData;
		GameViewSony.salesData = salesData["Sony"];
		GameViewSony.init();

		let nintendoData = formattedData.filter((x) => x.platform_company == "Nintendo");
		GameViewNintendo.data = nintendoData;
		GameViewNintendo.salesData = salesData["Nintendo"];
		GameViewNintendo.init();

		let pcData = formattedData.filter((x) => x.platform_company == "PC");
		GameViewPC.data = pcData;
		GameViewPC.salesData = salesData["PC"];
		GameViewPC.init();

		let othersData = formattedData.filter((x) => x.platform_company == "Others");
		GameViewOther.data = othersData;
		GameViewOther.salesData = salesData["Others"];
		GameViewOther.init();
	});
};
let update = (index, progress) => {
	let controller = indexes[index];
};

let activate = (index) => {
	activeIndex = index;
	let sign = activeIndex - lastIndex < 0 ? -1 : 1;
	let scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);

	let removeArray = sectionNumbers.filter((x) => scrolledSections.indexOf(x) < 0);

	removeArray.forEach((i) => {
		let controller = indexes[i];

		controller.hide();
	});

	scrolledSections.forEach(function (i) {
		let controller = indexes[i];

		controller.highlight();
	});
	lastIndex = activeIndex;
};

const display = () => {
	initialize();
	let scroll = scroller().container(d3.select("#graphic"));
	scroll(d3.selectAll(".step"));

	// setup event handling
	scroll.on("active", (index) => {
		d3.selectAll(".step").style("opacity", function (d, i) {
			return i === index ? 1 : 0.1;
		});
		activate(index);
	});
	indexes[0].highlight();

	scroll.on("progress", function (index, progress) {
		update(index, progress);
	});
};

display();
