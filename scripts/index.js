const input = d3.select("#date-range");
const currentDate = d3.select("#currentDate");
d3.csv("./data/full_data.csv", function (row) {
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
}).then(function (d) {
	const dataset = formatData(d);
	input.attr("min", 0);
	input.attr("max", Object.keys(dataset.data).length);
	input.attr("value", Object.keys(dataset.data).length);

	const dates = Object.keys(dataset.data).map((e) => new Date(e));
	const timeFormat = d3.timeFormat("%Y-%m-%d");
	const inputScale = d3
		.scaleLinear()
		.domain([0, input.attr("max") - 1])
		.range(d3.extent(dates));
	function changeInputRange(value) {
		const currentSelectedDate = inputScale(value);
		currentDate.text(timeFormat(currentSelectedDate));
		drawGraphs(dataset, timeFormat(currentSelectedDate));
	}
	changeInputRange(Object.keys(dataset.data).length);
	input.on("change", function (e) {
		changeInputRange(d3.event.target.value);
	});
});
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
function drawGraphs(dataset, currentSelectedDate) {
	drawMap(dataset, currentSelectedDate);
	drawPie(dataset, currentSelectedDate);
}
