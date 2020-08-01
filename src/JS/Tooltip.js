import * as d3 from "d3";
export class Tooltip {
	constructor(id) {
		const currentDiv = d3.select(`#${id}`);
		this.tooltip = currentDiv.append("div");

		this.tooltip.classed("tooltip", true);
	}
	show() {
		this.tooltip.style("opacity", 1);
	}
	hide() {
		this.tooltip.style("opacity", 0);
	}
	position({ x, y }) {
		this.tooltip.style(
			"transform",
			`translate(` +
				`calc( -50% + ${x}px),` +
				`calc(-100% + ${y}px)` +
				`)`
		);
	}
	html(html) {
		this.tooltip.html(html);
	}
	arrow(allow = false) {
		if (allow) {
			this.tooltip.classed("arrow", true);
		} else {
			this.tooltip.classed("arrow", false);
		}
	}
}
