<template>
  <Button label="visualise" @click="visualise(results)"/>
  <svg id="svg" width="300" height="300"></svg>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "optionsVis",
  props: [
    "results"
  ],
  methods: {
    getOptionLabel(option) {
      let label = ""
      Object.keys(option).forEach(d => {
        label = label + d + ": " + option[d] + "; "
      })
      return label
    },
    visualise(results) {
      let width = 300
      let height = 200
      const margin = ({top: 20, right: 0, bottom: 30, left: 150})

      var svg = d3.select("#svg")
          .attr("viewBox", [0, 0, width, height]);

      svg.selectAll('*').remove();


      results.forEach(d => console.log(this.getOptionLabel(d.option)))

      let y = d3.scaleBand()
          .domain(results.map(d => this.getOptionLabel(d.option)))
          .rangeRound([margin.top, height - margin.bottom])
          .padding(0.1)

      let x = d3.scaleLinear()
          .domain([0, 1])
          .range([margin.left, width-margin.right])


      svg.append("g")
          .attr("fill", "green")
          .selectAll("rect")
          .data(results)
          .join("rect")
          .attr("y", d => y(this.getOptionLabel(d.option)))
          .attr("x", margin.left)
          .attr("height", y.bandwidth())
          .attr("width", d => x(d.value)- x(0));

      let yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(null, "2d"))

      svg.append("g")
          .call(yAxis);
    }

  }


}


</script>

<style scoped>

</style>