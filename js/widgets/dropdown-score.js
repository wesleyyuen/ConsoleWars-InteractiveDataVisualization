export const dropdownScoreWidget = (selection, props) => {
	const { selectedOption, options, onOptionSelected } = props;

	selection
		.append("button")
		.attr("class", "btn btn-secondary dropdown-toggle dropdown-score")
		.attr("id", "dropdownMenuButton")
		.attr("data-toggle", "dropdown")
		.attr("aria-haspopup", "true")
		.attr("aria-expanded", "false")
		.attr("type", "button")
		.text(selectedOption);

	let dropdown = selection.append("div").attr("class", "dropdown-menu").attr("aria-labelledby", "dropdownMenuButton");

	dropdown
		.selectAll("a")
		.data(options)
		.join("a")
		.attr("class", "dropdown-item")
		.text((d) => d)
		.on("click", function (selected) {
			d3.select(".dropdown-score").text(selected);
			onOptionSelected(selected);
		});
};
