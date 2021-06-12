<template>
  <div ref="container"/>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "bar",
  props: [
    "value",
      "color"
  ],
  mounted() {
    this.visualise()
  },
   watch :{
    value: function() {
      this.visualise()
    },
    color: function() {
      this.visualise()
    }
  },
  methods: {
    visualise() {
      let width = 300
      let height = 50

      let color = "black"
      if (this.color === "trafficlight") {
        const colorScale = d3.scaleQuantize()
            .domain([0, 1])
             .range(["red", "chocolate", "darkGoldenRod", "yellowgreen", "green"]);
        color = colorScale(this.value)
      }
      else if (this.color === "bluescale") {
        const colorScale = d3.scaleLinear()
            .domain([0, 1])
            .range(["darkslategrey", "midnightblue"]);
        color = colorScale(this.value)
      }
      else color = this.color

      d3.select(this.$refs.container).selectAll("*").remove()

      var svg = d3.select(this.$refs.container)
          .append("svg")
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
          .attr("width", x(this.value));



    }
  }
}
</script>

<style scoped>

</style>