<template>
  <div ref="container"/>
  <Button label="vis" @click="visualise()"/>
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
      exNodes: [{"name": "a"}, {"name": "b"}, {"name": "c"}],
      exEdges: [
        {"target": "a", "source": "b"},
        {"target": "a", "source": "c"}
      ]
    }
  },
  mounted() {
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
          .force('collision', d3.forceCollide().radius(20))
          .force("center", d3.forceCenter(width / 2, height / 2))
          .force("y", d3.forceY())

      var svg = d3.select(this.$refs.container)
          .append("svg")
          .attr("viewBox", [0, 0, width, height]);

      svg.selectAll('*').remove();

      const link = svg.append("g")
          .attr("stroke", "black")
          .attr("stroke-opacity", 0.6)
          .selectAll("line")
          .data(links)
          .join("line")
          .attr("stroke-width", 0.5);

      var colorScale = d3.scaleQuantize()
          .domain([0, 1])
          .range(["red", "darkGoldenRod", "green"]);

      var color = d => {
        if (d === 1) return "black"
        else return colorScale(d)
      }

      const node = svg.append("g")
          .attr("stroke-width", 0.5)
          .selectAll("rect")
          .data(nodes)
          .join("rect")
          .attr("width", 25)
          .attr("height", 10)
          .attr('fill', "white")
          .attr("stroke", d => color(d.probability))
          .attr("rx", 2)
          .attr("ry", 2)



      // Text to nodes
      const text = svg.append("g")
          .attr("class", "text")
          .attr('font-size', '4px')
          .selectAll("text")
          .data(nodes)
          .enter().append("text")

      const textName = text.append("tspan")
            .text(d => d.name.substring(0,10) + ": ")
      const textState = text.append("tspan")
          .text(d => String(d.state).substring(0,10))
          .attr("dy", 5)

      simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("x", d => d.x -12)
            .attr("y", d => d.y - 9);

         text.attr("x", d => d.x -12) //position of the lower left point of the text
          .attr("y", d => d.y -5 ); //position of the lower left point of the text

        textState.attr("x", d => d.x -11)
        textName.attr("x", d=> d.x -11)

      });


    }
  }
}
</script>

<style scoped>

</style>