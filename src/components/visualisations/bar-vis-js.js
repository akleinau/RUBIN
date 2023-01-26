import * as d3 from "d3";

export function createSVG(width, value, color_name) {

    let height = 50

    let color = "black"
    if (color_name === "trafficlight") {
        const colorScale = d3.scaleQuantize()
            .domain([0, 1])
            .range(["red", "chocolate", "darkGoldenRod", "yellowgreen", "green"]);
        color = colorScale(this.value)
    } else if (color_name === "bluescale") {
        const colorScale = d3.scaleLinear()
            .domain([0, 1])
            .range(["darkslategrey", "midnightblue"]);
        color = colorScale(this.value)
    } else color = color_name


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
        .attr("fill", color)
        .attr("y", 0)
        .attr("x", 0)
        .attr("height", 50)
        .attr("width", x(value));

    return svg.node()

}