import * as d3 from "d3";

/**
 * returns svg to display two-sided bar with given width and value
 *
 * @param width
 * @param value
 * @returns {*}
 */
export function createSVG(width, value) {
    let height = 50

    var color = d3.scaleQuantize()
        .domain([-1, 1])
        .range(["maroon", "#5bd75b"]);

    var svg = d3.create("svg")
        .attr("height", 25)
        .attr("viewBox", [0, 0, width, height]);

    let length = d3.scaleLinear()
        .domain([0, 0.1])
        .range([0, width / 2])

    let x = 0

    let absValue = value
    if (value < 0) {
        absValue *= -1
        x = -length(absValue)
    }

    svg.append("rect")
        .attr("fill", color(value))
        .attr("y", 3)
        .attr("x", width / 2 + x)
        .attr("height", height - 6)
        .attr("width", length(absValue));

    svg.append("line")
        .style("stroke", "black")
        .style("stroke-width", 3)
        .attr("x1", width / 2)
        .attr("y1", 0)
        .attr("x2", width / 2)
        .attr("y2", height);

    return svg.node()

}