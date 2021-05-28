<template>
<div ref="container"/>
</template>

<script>
import * as d3 from "d3";
import * as dag from "d3-dag"

export default {
name: "sugiyama",
    props: [
    "nodes",
    "edges"
  ],
  computed: {
    edgeList: function(){
      const list = []
      this.edges.forEach(d => {
        list.push([d["source"], d["target"]])
      })
      console.log(list)
      return list
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
  data() {
    return {
      exNodes: [{"name": "a", "state": "pa"},
        {"name": "b", "state": "pb"},
        {"name": "c", "state": "pc"}],
       exEdges: [
        {"target": "Therapy", "source": "LVSI"},
        {"target": "Therapy", "source": "LNM"}
      ]
    }
  },
  methods: {
    getState(node) {
      return this.nodes.find(d => d.name === node.data.id).state
    },
    getProbability(node) {
      return this.nodes.find(d => d.name === node.data.id).probability
    },
    visualise() {

      if (this.nodes !== null && this.edges !== null) {

        var graph = dag.dagConnect()(this.edgeList)
        console.log(graph)

        const layout = dag.sugiyama()
            .layering(dag.layeringSimplex())
            .decross(dag.decrossTwoLayer().order(dag.twolayerOpt()))
            .coord(dag.coordCenter())
            .nodeSize((node) => {
              const size = node instanceof dag.SugiDummyNode ? 2 : 11;
              return [size * 3, size * 1.8];
            })

        layout(graph)

        const width = this.nodes.length* 12
        const height = this.nodes.length* 13

        var colorScale = d3.scaleQuantize()
            .domain([0, 1])
            .range(["red", "darkGoldenRod", "green"]);

        var color = d => {
          if (d === 1) return "black"
          else return colorScale(d)
        }


        d3.select(this.$refs.container).selectAll("*").remove()

        var svg = d3.select(this.$refs.container)
            .append("svg")
            .attr("viewBox", [0, 0, width, height]);

        const arrow = d3.symbol().type(d3.symbolTriangle).size(5);
        svg.append('g')
            .selectAll('path')
            .data(graph.links())
            .enter()
            .append('path')
            .attr('d', arrow)
            .attr('transform', ({points}) => {
              const [end, start] = points.slice().reverse();
              // This sets the arrows the node radius (20) + a little bit (3) away from the node center, on the last line segment of the edge. This means that edges that only span ine level will work perfectly, but if the edge bends, this will be a little off.
              const dx = start.x - end.x;
              const dy = start.y - end.y;
              const normal = Math.sqrt(dx * dx + dy * dy);
              // This is the angle of the last line segment
              const angle = Math.atan2(-dy, -dx) * 180 / Math.PI + 90;
              return `translate(${end.x + 7 * dx / normal}, ${end.y + 7* dy / normal}) rotate(${angle})`;
            })
            .attr('fill', "black")

        const line = d3.line()
            .curve(d3.curveCatmullRom)
            .x(d => d.x)
            .y(d => d.y)

        svg.append('g')
            .selectAll('path')
            .data(graph.links())
            .enter()
            .append('path')
            .attr('d', ({points}) => line(points))
            .attr('fill', 'none')
            .attr('stroke-width', 0.5)
            .attr('stroke', "black")


        const nodes = svg.append('g')
            .selectAll('g')
            .data(graph.descendants())
            .enter()
            .append('g')
            .attr('transform', ({x, y}) => `translate(${x}, ${y})`)

        nodes.append('rect')
            .attr("width", 25)
            .attr("height", 10)
            .attr('fill', "white")
            .attr("stroke-width", 0.5)
            .attr("stroke", d => color(this.getProbability(d)))
            .attr("rx", 2)
            .attr("ry", 2)
            .attr('transform', `translate(-12.5,-4)`)

        // Add text to nodes
        nodes.append('text')
            .text(d => String(d.data.id).substring(0, 10) + ": ")
            .attr("class", "text")
            .attr('text-anchor', 'middle')
            .attr('font-size', '4px')

        // Add text to nodes
        nodes.append('text')
            .text(d => String(this.getState(d)).substring(0, 10))
            .attr("class", "text")
            .attr('font-size', '4px')
            .attr('text-anchor', 'middle')
            .attr("dy", 5)


      }


    }
  }
}



</script>

<style scoped>

</style>