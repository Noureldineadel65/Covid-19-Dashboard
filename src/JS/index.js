import "../styles/scss/main.scss";
import * as d3 from "d3";
import {
	formatCSV,
	formatData,
	generateRandomColorsForCountries,
	getMonth,
	getAccessor,
} from "./utils";
import drawPie from "./draw-pie";
import drawMap from "./draw-map";
const fullDate = document.getElementById("fullDate");
d3.csv("./data/full_data.csv", formatCSV)
	.then(setUpDashboard)
	.catch(handleError);

function setUpDashboard(data) {
	const dataset = formatData(data);

	const input = d3.select("#date-range");
	const currentDate = d3.select("#currentDate");
	input.attr("min", 0);
	input.attr("max", Object.keys(dataset.data).length);
	input.attr("value", Object.keys(dataset.data).length);
	let accessor = "biweekly_deaths";
	const dates = Object.keys(dataset.data).map((e) => new Date(e));
	const timeFormat = d3.timeFormat("%Y-%m-%d");
	const inputScale = d3
		.scaleLinear()
		.domain([0, input.attr("max")])
		.range(d3.extent(dates));
	function changeInputRange(value) {
		const currentSelectedDate = inputScale(value);
		fullDate.innerHTML = `${getMonth(
			currentSelectedDate.getUTCMonth()
		)} ${currentSelectedDate.getDate()} ${currentSelectedDate.getFullYear()}`;

		currentDate.text(timeFormat(currentSelectedDate));
		drawGraphs(dataset, timeFormat(currentSelectedDate), accessor);
	}
	changeInputRange(Object.keys(dataset.data).length);
	input.on("input", function (e) {
		changeInputRange(d3.event.target.value);
	});
}
function drawGraphs(dataset, currentSelectedDate, accessor) {
	drawMap(dataset, currentSelectedDate, getAccessor(accessor));
	drawPie(dataset, currentSelectedDate, getAccessor(accessor));
}
function handleError(e) {
	// alert("Error");
}
