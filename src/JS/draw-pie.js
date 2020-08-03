import * as d3 from "d3";

import {
	generateChartContainer,
	alterIndex,
	progressNumber,
	getPercentageDifference,
	midAngle,
} from "./utils";
import { transition } from "d3";
const { dimensions, wrapper, bounds, tooltip } = generateChartContainer(
	"pie-chart",
	[0, 0, 0, 0],
	true
);
// Disabling the arrow under the tooltip
tooltip.arrow(false);
// Pallet for chart
const colorPallet = ["#390099", "#9E0059", "#FF5400", "#FF0054", "#FFBD00"];
// Get Accessors
const weeklyAccessor = (d) => d.weekly_cases;
// Generating Path function for Pie Chart
const path = d3
	.arc()
	.innerRadius(dimensions.width * 0.4)
	.outerRadius(dimensions.width * 0.7);
// Outer Arc for Label and polyline :)
const outerArc = d3
	.arc()
	.innerRadius(dimensions.getBoundedWidth() * 0.8)
	.outerRadius(dimensions.getBoundedWidth() * 0.6);
// Generating Chart Group to insert Paths elements inside
const pieChart = bounds.append("g").classed("pie", true);
// generating label group for Polylines
const labelGroup = bounds.append("g").classed("label", true);
// Generating label group
const legend = bounds.append("g").classed("legend-pie", true);
legend.style(
	"transform",
	`translate(${dimensions.width + 25}px, ${-dimensions.height - 80}px)`
);
// Generating label group for Squares
const legendRectGroup = legend.append("g").classed("rect-colors", true);
// Generating label group for text
const legendTextGroup = legend.append("g").classed("legend-labels", true);

// Update Pattern

export default function (datasets, currentSelectedDate) {
	const { data, minYear, maxYear } = datasets;
	const dataset = Object.values(data[currentSelectedDate])
		.filter(weeklyAccessor)
		.sort((a, b) => weeklyAccessor(b) - weeklyAccessor(a))
		.filter((e) => e.location !== "World" && e.location !== "International")
		.slice(0, 5);

	const colorScale = d3
		.scaleOrdinal()
		.domain(dataset.map((e) => e.location))
		.range(colorPallet);

	const sumCases = dataset
		.map((e) => e.weekly_cases)
		.reduce((a, b) => a + b, 0);
	const arcs = d3.pie().value(weeklyAccessor)(dataset);

	const pieChartUpdate = pieChart.selectAll("path").data(arcs);
	const updatePolylines = labelGroup.selectAll("polyline").data(arcs);
	const labelsUpdate = labelGroup.selectAll("text").data(arcs);
	const legendRectUpdate = legendRectGroup.selectAll("rect").data(dataset);

	const legendTextUpdate = legendTextGroup.selectAll("text").data(dataset);

	const chart = pieChartUpdate
		.enter()

		.append("path")

		.classed("arc", true)

		.on("mouseenter", onMouseEnter)
		.on("mouseleave", onMouseLeave)

		.merge(pieChartUpdate)
		.attr("stroke", "white")
		.attr("fill", (d) => colorScale(d.data.location))
		.attr("d", path)
		.on("mouseenter", onMouseEnter)
		.on("mouseleave", onMouseLeave);
	pieChartUpdate.exit().remove();
	console.log(pieChartUpdate);
	const polylines = updatePolylines
		.enter()
		.append("polyline")
		.merge(updatePolylines)

		.attr("stroke", "#b9b4b2")
		.style("fill", "none")
		.attr("stroke-width", 1.5)
		.attr("points", function (d) {
			const pos = outerArc.centroid(d);
			if (d.endAngle - d.startAngle < 0.13) {
				pos[0] = dimensions.getBoundedWidth() * 0.8 * 1;
			} else {
				pos[0] =
					dimensions.getBoundedWidth() *
					0.8 *
					(midAngle(d) < Math.PI ? 1 : -1);
			}
			const formula = Math.abs(
				1.5 / d.endAngle - d.startAngle / 4 - 0.1
			).toFixed(1);
			function applyFormula(e) {
				if (formula <= 1) {
					return e;
				} else {
					return e * Number(formula);
				}
			}
			return [
				path.centroid(d),
				alterIndex(outerArc.centroid(d), 1, applyFormula),
				alterIndex(pos, 1, applyFormula),
			];
		});
	updatePolylines.exit().remove();
	const labels = labelsUpdate
		.enter()
		.append("text")
		.merge(labelsUpdate)
		.attr("dy", ".35em")
		.style("font-size", "1rem")

		.html(function (d) {
			return d.data.weekly_cases.toLocaleString();
		})
		.attr("transform", function (d) {
			const pos = outerArc.centroid(d);
			if (d.endAngle - d.startAngle < 0.13) {
				pos[0] = dimensions.getBoundedWidth() * 0.93 * 1;
			} else {
				pos[0] =
					dimensions.getBoundedWidth() *
					0.83 *
					(midAngle(d) < Math.PI ? 1 : -1);
			}
			const formula = Math.abs(
				1.5 / d.endAngle - d.startAngle / 4 - 0.1
			).toFixed(1);
			function applyFormula(e) {
				if (formula <= 1) {
					return e;
				} else {
					return e * Number(formula);
				}
			}
			return "translate(" + alterIndex(pos, 1, applyFormula) + ")";
		})
		.style("text-anchor", function (d) {
			return midAngle(d) < Math.PI ? "start" : "end";
		});
	labelsUpdate.exit().remove();
	const legendRect = legendRectUpdate
		.enter()
		.append("rect")
		.merge(legendRectUpdate)
		.attr("x", (d, i) => -20)
		.attr("y", (d, i) => 20 * i)
		.attr("width", 10)
		.attr("height", 10)
		.attr("fill", (d) => colorScale(d.location));
	legendRectUpdate.exit().remove();
	const legendText = legendTextUpdate
		.enter()
		.append("text")
		.merge(legendTextUpdate)
		.text((d) => d.location)
		.attr("y", (d, i) => 20 * i + 10)
		.style("font-size", "1rem");
	legendTextUpdate.exit().remove();
	// Mouse Events
	function onMouseEnter(datum) {
		// Positioning Tooltip
		tooltip.position({
			x: d3.event.pageX - wrapper.attr("width") - 50,
			y: d3.event.pageY - 200,
		});
		const { location, weekly_cases } = datum.data;
		const perc = wrapper
			.append("text")
			.classed("progress", true)
			.style("font-size", `${dimensions.width / 45}rem`)
			.attr("x", dimensions.width)
			.attr("y", dimensions.height)
			.style(
				"transform",
				`translate(calc(50% - ${dimensions.width}px),calc(50% - ${dimensions.height}px))`
			)
			.style("text-anchor", "middle");
		wrapper
			.append("text")
			.classed("progress-exp", true)
			.text("of top 5 countries")

			.style("font-size", `${dimensions.width / 150}rem`)
			.attr("x", dimensions.width)
			.attr("y", dimensions.height)
			.style(
				"transform",
				`translate(calc(50% - ${dimensions.width}px),calc(50% - ${
					dimensions.height - (dimensions.width / 45) * 5
				}px))`
			)
			.style("text-anchor", "middle");
		// Progress text element from 0 to a certain number for visual effect
		progressNumber(getPercentageDifference(weekly_cases, sumCases), perc);

		tooltip.html(`
		<p>${location}</p>
		<p>${weekly_cases.toLocaleString()} Cases</p>
		`);
		tooltip.show();
		d3.select(this).transition().duration(250).attr("fill", "#fff");
	}
	function onMouseLeave(datum) {
		tooltip.hide();
		wrapper.selectAll(".progress").remove();
		wrapper.selectAll(".progress-exp").remove();
		d3.select(this)
			.transition()
			.duration(250)
			.attr("fill", colorScale(datum.data.location));
	}
}
