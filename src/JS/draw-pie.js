import * as d3 from "d3";
import { Tooltip } from "./Tooltip";
import { generateChartContainer } from "./utils";
export default function (datasets, currentSelectedDate) {
	const { dimensions, wrapper, bounds } = generateChartContainer(
		"pie-chart",
		[0, 0, 0, 0]
	);
	const { data, minYear, maxYear } = datasets;
	const weeklyAccessor = (d) => d.weekly_cases;
	const dataset = Object.values(data[currentSelectedDate])
		.filter(weeklyAccessor)
		.sort((a, b) => weeklyAccessor(b) - weeklyAccessor(a))
		.filter((e) => e.location !== "World" && e.location !== "International")
		.slice(0, 10);
	const colorScale = d3
		.scaleOrdinal()
		.domain(dataset.map((e) => e.location))
		.range(d3.schemeCategory10);
	const arcs = d3.pie().value(weeklyAccessor)(dataset);
	const path = d3
		.arc()
		.innerRadius(dimensions.getBoundedWidth() / 4)
		.outerRadius(dimensions.getBoundedWidth() / 2 - 10);
	const chart = bounds
		.append("g")
		.classed("pie", true)
		.selectAll(".arc")
		.data(arcs)
		.enter()
		.append("path")
		.classed("arc", true)
		.attr("stroke", "white")
		.attr("fill", (d) => colorScale(d.data.weekly_cases))
		.attr("d", path)
		.on("mouseenter", onMouseEnter)
		.on("mouseleave", onMouseLeave);
	const pieTooltip = new Tooltip("pie-chart");
	pieTooltip.arrow(false);
	function onMouseEnter(datum) {
		pieTooltip.position({
			x: d3.event.pageX - wrapper.attr("width"),
			y: d3.event.pageY,
		});
		const { location, weekly_cases } = datum.data;
		pieTooltip.html(`
		<p>${location}</p>
		<p>${weekly_cases.toLocaleString()} Cases</p>
		`);
		pieTooltip.show();
		d3.select(this).transition().duration(250).attr("fill", "#fff");
	}
	function onMouseLeave(datum) {
		pieTooltip.hide();
		d3.select(this)
			.transition()
			.duration(250)
			.attr("fill", colorScale(datum.data.weekly_cases));
	}

	// pieTooltip.getTooltip().innerHTML = `<p>HIIIIII</p>`;
}
