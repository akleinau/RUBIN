<template>
  <div>
    The network is:
    <Chip  class="p-mx-1" style="background-color:green" label="very sure"> </Chip>
    <Chip  class="p-mx-1" style="background-color:darkgoldenrod" label="less sure"></Chip>
    <Chip  class="p-mx-1" style="background-color:red" label="not sure"></Chip>
    , or the value is
    <Chip  class="p-mx-1" style="background-color:black" label="given"> </Chip>
  </div>
  <div ref="container"/>
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
    if (this.nodes != null && this.edges != null) {
      this.visualise()
    }
  },
  watch :{
    nodes: function() {
      this.visualise()
    },
    edges: function() {
      this.visualise()
    }
  },
  methods: {
    normalVect(v1, v2) {
      let x = v1.x - v2.x
      let y = v1.y - v2.y
      let xq = Math.pow(x,2)
      let yq = Math.pow(y, 2)
      return Math.sqrt(xq + yq)
    },
    visualise() {
      const width = 200
      const height = 200

      if (this.nodes !== null && this.edges !== null) {

        let links = JSON.parse(JSON.stringify(this.edges))
        let nodes = JSON.parse(JSON.stringify(this.nodes))

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.name))
            .force('collision', d3.forceCollide().radius(15))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("y", d3.forceY(height / 2))

        d3.select(this.$refs.container).selectAll("*").remove()

        var svg = d3.select(this.$refs.container)
            .append("svg")
            .attr("viewBox", [0, 0, width, height]);

        // Define the arrowhead marker variables
        const markerBoxWidth = 4;
        const markerBoxHeight = 4;
        const refX = markerBoxWidth / 2;
        const refY = markerBoxHeight / 2;
        const arrowPoints = [[0, 0], [0, 4], [4, 2]];

        svg
            .append('defs')
            .append('marker')
            .attr('id', 'arrow')
            .attr('viewBox', [0, 0, markerBoxWidth, markerBoxHeight])
            .attr('refX', refX)
            .attr('refY', refY)
            .attr('markerWidth', markerBoxWidth)
            .attr('markerHeight', markerBoxHeight)
            .attr('orient', 'auto-start-reverse')
            .append('path')
            .attr('d', d3.line()(arrowPoints))
            .attr('stroke', 'black');

        const link = svg.append("g")
            .attr("stroke", "black")
            .attr("stroke-opacity", 0.6)
            .selectAll("path")
            .data(links)
            .join("line")
            .attr("stroke-width", 0.5)
            .attr('d', link)
            .attr('marker-end', 'url(#arrow)')
            .attr('stroke', 'black')
            .attr('fill', 'none');


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
            .text(d => d.name.substring(0, 10) + ": ")
        const textState = text.append("tspan")
            .text(d => String(d.state).substring(0, 10))
            .attr("dy", 5)

        simulation.on("tick", () => {
          link
              .attr("x1", d => d.source.x)
              .attr("y1", d => d.source.y)
              .attr("x2", d => d.target.x - 15 * ((d.target.x - d.source.x) / this.normalVect(d.target, d.source)))
              .attr("y2", d => d.target.y - 7 * ((d.target.y - d.source.y) / this.normalVect(d.target, d.source)));

          node
              .attr("x", d => d.x - 12.5)
              .attr("y", d => d.y - 5);

          text.attr("x", d => d.x) //position of the lower left point of the text
              .attr("y", d => d.y - 1); //position of the lower left point of the text

          textState.attr("x", d => d.x - 10)
          textName.attr("x", d => d.x - 10)

        });

        console.log(this.nodes)
        console.log(this.edges)
      }
    }
  }
}
</script>

<style scoped>
.p-chip {
  color: white;
}
</style>