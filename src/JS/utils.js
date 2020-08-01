import * as d3 from "d3";
export function formatCSV(row) {
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
export function formatData(data) {
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
export function generateChartContainer(id, margins) {
	const currentDiv = document.querySelector(`#${id}`);

	const [top, right, bottom, left] = margins;
	const dimensions = {
		width: currentDiv.clientWidth * 0.65,
		height: currentDiv.clientHeight * 0.65,
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
		.attr("width", currentDiv.clientWidth)

		.attr("height", currentDiv.clientHeight);

	const bounds = wrapper
		.append("g")
		.attr(
			"transform",
			`translate(${
				id === "pie-chart"
					? currentDiv.clientWidth / 2
					: dimensions.margin.left
			}, ${
				id === "pie-chart"
					? currentDiv.clientHeight / 2
					: dimensions.margin.top
			})`
		);

	return { dimensions, wrapper, bounds };
}
