export const dropdownGenreWidget = (selection, props) => {
	const { options, onOptionSelected, selectedGenre } = props;

	selection
		.append("button")
		.attr("class", "btn btn-secondary dropdown-toggle dropdown-genre")
		.attr("id", "dropdownMenuButton")
		.attr("data-toggle", "dropdown")
		.attr("aria-haspopup", "true")
		.attr("aria-expanded", "false")
		.attr("type", "button")
		.text(selectedGenre);

	let dropdown = selection.append("div").attr("class", "dropdown-menu").attr("aria-labelledby", "dropdownMenuButton");

	dropdown
		.selectAll("a")
		.data(options)
		.join("a")
		.attr("class", "dropdown-item")
		.text((d) => d)
		.on("click", function (selected) {
			d3.select(".dropdown-genre").text(selected);
			onOptionSelected(selected);
		});
};
