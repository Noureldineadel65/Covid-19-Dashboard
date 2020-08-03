import * as d3 from "d3";

import {
	generateChartContainer,
	alterIndex,
	progressNumber,
	getPercentageDifference,
} from "./utils";
const { dimensions, wrapper, bounds, tooltip } = generateChartContainer(
	"pie-chart",
	[0, 0, 0, 0],
	true
);

export default function (datasets, currentSelectedDate) {
	const { data, minYear, maxYear } = datasets;
	const colorPallet = ["#390099", "#9E0059", "#FF5400", "#FF0054", "#FFBD00"];

	const weeklyAccessor = (d) => d.weekly_cases;
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
	const path = d3
		.arc()
		.innerRadius(dimensions.width * 0.4)
		.outerRadius(dimensions.width * 0.7);
	const outerArc = d3
		.arc()
		.innerRadius(dimensions.getBoundedWidth() * 0.8)
		.outerRadius(dimensions.getBoundedWidth() * 0.6);
	const pieChart = bounds.append("g").classed("pie", true);
	const u = pieChart.selectAll("path").data(arcs);
	const chart = u
		.enter()

		.append("path")
		.classed("arc", true)
		.on("mouseenter", onMouseEnter)
		.on("mouseleave", onMouseLeave)
		.merge(u)

		.attr("stroke", "white")
		.attr("fill", (d) => colorScale(d.data.location))
		.attr("d", path)
		.on("mouseenter", onMouseEnter)
		.on("mouseleave", onMouseLeave);
	tooltip.arrow(false);
	u.exit().remove();

	function onMouseEnter(datum) {
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
	const labelGroup = bounds.append("g").classed("label", true);

	const updatePolylines = labelGroup.selectAll("polyline").data(arcs);
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
	const labels = labelGroup
		.selectAll("text")
		.data(arcs)
		.enter()
		.append("text")
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
	const legend = bounds.append("g").classed("legend-pie", true);
	legend.style(
		"transform",
		`translate(${dimensions.width + 25}px, ${-dimensions.height - 80}px)`
	);
	const legendRect = legend
		.append("g")
		.classed("rect-colors", true)
		.selectAll("rect")
		.data(dataset)
		.enter()
		.append("rect")
		.attr("x", (d, i) => -20)
		.attr("y", (d, i) => 20 * i)
		.attr("width", 10)
		.attr("height", 10)
		.attr("fill", (d) => colorScale(d.location));
	const legendText = legend
		.append("g")
		.classed("legend-labels", true)
		.selectAll("text")
		.data(dataset)
		.enter()
		.append("text")
		.text((d) => d.location)
		.attr("y", (d, i) => 20 * i + 10)
		.style("font-size", "1rem");
	function midAngle(d) {
		return d.startAngle + (d.endAngle - d.startAngle) / 2;
	}
}
