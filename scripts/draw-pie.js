function drawPie(datasets, currentSelectedDate) {
	const { dimensions, wrapper, bounds } = generateChartContainer(
		"pie-chart",
		[10, 10, 10, 10]
	);
	const { data, minYear, maxYear } = datasets;
	const weeklyAccessor = (d) => d.weekly_cases;
	const dataset = Object.values(data[currentSelectedDate])
		.filter(weeklyAccessor)
		.sort((a, b) => weeklyAccessor(b) - weeklyAccessor(a))
		.filter((e) => e.location !== "World" && e.location !== "International")
		.slice(0, 20);
	const colorScale = d3
		.scaleLinear()
		.domain(d3.extent(dataset, weeklyAccessor))
		.range(["blue", "red"]);
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
		.attr("d", path);
}
