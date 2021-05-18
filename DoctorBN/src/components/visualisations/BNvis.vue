<template>
  <div ref="container"/>
  <Button label="vis" @click="visualise()" />
</template>

<script>
import * as d3 from "d3";

export default {
  name: "BNvis",
  props: [
    "nodes",
    "edges"
  ],
  data() {
    return {
      exNodes: [{"name":"a"},{"name": "b"} ,{"name": "c"}],
      exEdges: [
        {"target": "a", "source": "b"},
        {"target": "a", "source": "c"}
      ]
    }
  },
  mounted(){
    if (this.nodes != null && this.edges != null) this.visualise()
  },
  methods: {
    visualise() {
      const width = 300
      const height = 150

      let links = this.edges
      let nodes = this.nodes

      const simulation = d3.forceSimulation(nodes)
          .force("link", d3.forceLink(links).id(d => d.name))
          .force("charge", d3.forceManyBody())
          .force("center", d3.forceCenter(width / 2, height / 2));

      var svg = d3.select(this.$refs.container)
          .append("svg")
          .attr("viewBox", [0, 0, width, height]);

      const link = svg.append("g")
          .attr("stroke", "black")
          .attr("stroke-opacity", 0.6)
          .selectAll("line")
          .data(links)
          .join("line")
          .attr("stroke-width", 1);

      const node = svg.append("g")
          .attr("stroke", "green")
          .attr("stroke-width", 1.5)
          .selectAll("circle")
          .data(nodes)
          .join("circle")
          .attr("r", 5)
          .attr("fill", "red")

      simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
      });


    }
  }
}
</script>

<style scoped>

</style>