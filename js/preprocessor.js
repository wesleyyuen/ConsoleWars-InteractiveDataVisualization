export const preprocessor = d3.csv("data/games.csv").then((data) => {
	let salesMax = 0,
		criticMax = 0,
		userMax = 0,
		maxScoreDiff = 0,
		salesMin = Infinity,
		criticMin = Infinity,
		userMin = Infinity,
		minScoreDiff = Infinity;

	function formatDataForMain() {
		const games = [
			[
				/*Sony*/
			],
			[
				/*Microsoft*/
			],
			[
				/*Nintendo*/
			],
			[
				/*PC*/
			],
		];
		for (const [i, d] of data.entries()) {
			if (d.Critic_Score === "" || d.User_Score === "") continue;

			const game = {};
			game.name = d.Name;
			game.platform = d.Platform;
			game.genre = d.Genre == "Platform" ? "Others" : d.Genre;
			game.publisher = d.Publisher;
			game.year = +d.Year_of_Release;
			game.na_sales = +d.NA_Sales;
			game.eu_sales = +d.EU_Sales;
			game.jp_sales = +d.JP_Sales;
			game.other_sales = +d.Other_Sales;
			game.global_sales = +d.Global_Sales;
			game.crit_score = +d.Critic_Score;
			game.user_score = +d.User_Score * 10;
			game.score_diff = game.user_score - game.crit_score;
			game.id_num = i;

			// update max min
			if (salesMax < game.global_sales) salesMax = game.global_sales;
			if (salesMin > game.global_sales) salesMin = game.global_sales;
			if (criticMax < game.crit_score) criticMax = game.crit_score;
			if (criticMin > game.crit_score) criticMin = game.crit_score;
			if (userMax < game.user_score) userMax = game.user_score;
			if (userMin > game.user_score) userMin = game.user_score;
			if (maxScoreDiff < game.score_diff) maxScoreDiff = game.score_diff;
			if (minScoreDiff > game.score_diff) minScoreDiff = game.score_diff;

			// Add platform_company column
			if (d.Platform.match(/^(PS|PS2|PS3|PS4|PSP|PSV)$/)) {
				game.console_company = "sony";
				games[0].push(game);
			} else if (d.Platform.match(/^(XB|X360|XOne)$/)) {
				game.console_company = "microsoft";
				games[1].push(game);
			} else if (d.Platform.match(/^(3DS|DS|GB|GBA|GC|N64|NES|SNES|Wii|WiiU)$/)) {
				game.console_company = "nintendo";
				games[2].push(game);
			} else if (d.Platform == "PC") {
				game.console_company = "pc";
				games[3].push(game);
			}
		}
		return games;
	}

	const mainViewData = formatDataForMain();
	const metadata = [criticMax, criticMin, userMax, userMin, maxScoreDiff, minScoreDiff];

	return { mainViewData, salesMax, salesMin, metadata };
});
