<template>
  <div ref="container"/>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "two-sided-bar-vis",
  props: [
    "value"
  ],
  mounted() {
    this.visualise()
  },
  methods: {
    visualise() {
      let width = 300
      let height = 50

      var color = d3.scaleQuantize()
          .domain([-1, 1])
          .range(["red", "green"]);

      var svg = d3.select(this.$refs.container)
          .append("svg")
          .attr("viewBox", [0, 0, width, height]);

      let length = d3.scaleLinear()
          .domain([0, 0.1])
          .range([0, width / 2])

      let x = 0

      let absValue = this.value
      if (this.value < 0) absValue *= -1

      if (this.value < 0) {
        x = -length(absValue)
      }

      svg.append("rect")
          .attr("fill", color(this.value))
          .attr("y", 3)
          .attr("x", width / 2 + x)
          .attr("height", height-6)
          .attr("width", length(absValue));

      svg.append("line")
          .style("stroke", "black")
          .style("stroke-width", 3)
          .attr("x1", width/2)
          .attr("y1", 0)
          .attr("x2", width/2)
          .attr("y2", height);

    }
  }
}
</script>

<style scoped>

</style>