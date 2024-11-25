import * as d3 from "d3";

/**
 * returns svg to display percentage bar with given width and color
 *
 * @param width
 * @param value
 * @param color_name
 * @returns {*}
 */
export function createSVG(width, value, color_name) {

    let height = 50

    var svg = d3.create("svg")
        .attr("height", 25)
        .attr("viewBox", [0, 0, width, height]);

    let x = d3.scaleLinear()
        .domain([0, 1])
        .range([0, width])

    svg.append("rect")
        .style("stroke", "black")
        .style("stroke-width", 3)
        .attr("fill", "white")
        .attr("y", 0)
        .attr("x", 0)
        .attr("height", height)
        .attr("width", width);

    svg.append("rect")
        .attr("fill", color_name)
        .attr("y", 0)
        .attr("x", 0)
        .attr("height", 50)
        .attr("width", x(value));

    return svg.node()

}