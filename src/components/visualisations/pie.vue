<template>
  <div ref="container"/>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "pie",
  props: [
    "value",
    "color"
  ],
  mounted() {
    this.visualise()
  },
  watch: {
    value: function () {
      this.visualise()
    },
    color: function () {
      this.visualise()
    }
  },
  methods: {
    visualise() {
      let width = 50
      let height = 50

      let color = "black"
      if (this.color === "trafficlight") {
       const colorScale = d3.scaleQuantize()
            .domain([0, 1])
            .range(["red", "darkGoldenRod", "green"]);
        color = colorScale(this.value)
      } else if (this.color === "bluescale") {
        const colorScale = d3.scaleLinear()
            .domain([0, 1])
            .range(["darkslategrey", "midnightblue"]);
        color = colorScale(this.value)
      } else color = this.color

      d3.select(this.$refs.container).selectAll("*").remove()

      var svg = d3.select(this.$refs.container)
          .append("svg")
          .attr("width", 50)
          .attr("height", 50)
          .attr("viewBox", [-width/2, -height/2, width, height]);

      const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(20)
      .startAngle(2*Math.PI)
      .endAngle((1-this.value)*2*Math.PI)

      svg.append('path')
          .attr('d', arc)
          .attr('fill', color)
          .attr("stroke", "black")
          .style("stroke-width", "1px")


    }
  }
}
</script>

<style scoped>

</style>