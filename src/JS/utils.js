import * as d3 from "d3";
import { Tooltip } from "./Tooltip";
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
export function generateChartContainer(id, margins, enableTooltip = false) {
	const currentDiv = document.querySelector(`#${id}`);

	const [top, right, bottom, left] = margins;
	console.log(
		currentDiv.clientWidth * 0.239 <= 114
			? 150
			: currentDiv.clientWidth * 0.239
	);
	const dimensions = {
		width:
			currentDiv.clientWidth * 0.239 <= 114
				? 150
				: currentDiv.clientWidth * 0.239,
		height:
			currentDiv.clientWidth * 0.239 <= 114
				? 150
				: currentDiv.clientWidth * 0.239,
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
		.attr("id", `${id}-wrapper`)
		.attr("width", currentDiv.clientWidth)

		.attr("height", currentDiv.clientHeight);

	let bounds = wrapper

		.append("g")
		.attr("id", `${id}-bound`)
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

	const resultObject = {
		dimensions,
		wrapper,
		bounds,
	};
	if (enableTooltip) {
		const tooltip = new Tooltip(id);
		resultObject.tooltip = tooltip;
	}
	return resultObject;
}
export function alterIndex(array, index, callback) {
	return array.map((e, i) => (i === index ? callback(e) : e));
}
function getRandomColor() {
	var letters = "0123456789ABCDEF";
	var color = "#";
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}
export function progressNumber(endNumber, element) {
	// Gets d3 text element (second arg) and progresses it up to a certain number (first arg)
	let num = 0;
	element.text(`${num}%`);
	const interval = setInterval(() => {
		num++;
		element.text(`${num}%`);
		if (num === endNumber) {
			clearInterval(interval);
		}
	}, 20);
}
export function getPercentageDifference(val1, val2) {
	return Math.round((val1 / val2) * 100);
}
export function midAngle(d) {
	return d.startAngle + (d.endAngle - d.startAngle) / 2;
}
export function generateRandomColorsForCountries(dataset) {
	const countries = Object.keys(dataset.data).map((e) => {
		return Object.keys(dataset.data[e]);
	});
	const highestNum = d3.extent(countries, (e) => e.length)[1];
	const res = Object.values(dataset.data).find((e) => {
		return Object.keys(e).length === highestNum;
	});

	const res2 = Object.keys(res).map((e) => {
		return {
			country: e,
			color: getRandomColor(),
		};
	});

	return d3
		.scaleOrdinal()
		.domain(res2.map((e) => e.country))
		.range(res2.map((e) => e.color));
}
export function getMonth(month) {
	const monthNames = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];
	return monthNames[month];
}
export function getAccessor(name) {
	const accessors = {
		biweekly_cases: (e) => e.biweekly_cases,
		biweekly_deaths: (e) => e.biweekly_deaths,
		date: (e) => e.date,
		location: (e) => e.location,
		new_cases: (e) => e.new_cases,
		new_deaths: (e) => e.new_deaths,
		total_cases: (e) => e.total_cases,
		total_deaths: (e) => e.total_deaths,
		weekly_cases: (e) => e.weekly_cases,
		weekly_deaths: (e) => e.weekly_deaths,
	};
	return accessors[name];
}
