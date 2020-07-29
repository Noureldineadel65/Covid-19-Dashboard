function formatCSV(row) {
	return {
		biweekly_cases: +row.biweekly_cases,
		biweekly_deaths: +row.biweekly_deaths,
		date: row.date,
		location: row.location,
		new_cases: +row.new_cases,
		total_cases: +row.total_cases,
		weekly_cases: +row.weekly_cases,
		weekly_deaths: +row.weekly_deaths,
	};
}
function formatData(data) {
	const allCountriesDates = [...new Set(data.map((e) => e.date))];
	const minYear = allCountriesDates[0];
	const maxYear = allCountriesDates.splice(-1)[0];
	const object = {};
	allCountriesDates.forEach((date) => {
		const countriesObject = {};
		data.filter((e) => e.date === date).forEach((e) => {
			countriesObject[e.location] = e;
		});
		object[date] = countriesObject;
	});
	return {
		data: object,
		minYear,
		maxYear,
	};
}
function generateChartContainer(id, margins) {
	const currentDiv = document.querySelector(`#${id}`);
	const [top, right, bottom, left] = margins;
	const dimensions = {
		width: currentDiv.clientWidth,
		height: currentDiv.clientHeight,
		margin: {
			top,
			right,
			bottom,
			left,
		},
		getBoundedWidth: function () {
			return this.width - this.margin.left - this.margin.right;
		},
		getBoundedHeight: function () {
			return this.height - this.margin.top - this.margin.bottom;
		},
	};
	const wrapper = d3
		.select(`#${id}`)
		.append("svg")
		.attr("width", dimensions.width)
		.attr(
			"transform",
			`translate(${dimensions.width / 2}, ${dimensions.height / 2})`
		)
		.attr("height", dimensions.height);
	const bounds = wrapper
		.append("g")
		.style(
			"transform",
			`translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
		);

	return { dimensions, wrapper, bounds };
}
