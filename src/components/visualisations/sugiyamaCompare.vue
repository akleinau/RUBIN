<template>
      in <span style="border:1px solid red; border-radius:5px"> changed nodes</span>  the different states are color coded:
    <Chip  class="p-mx-1" style="background-color:black" label="current"> </Chip>
    <Chip  class="p-mx-1" style="background-color:#6d00bf" :label="name2"></Chip>
<div ref="container"/>
</template>

<script>
import * as d3 from "d3";
import * as dag from "d3-dag"

export default {
name: "sugiyamaCompare",
    props: [
    "nodes",
    "edges",
      "nodes2",
        "name2",
        "labels"
  ],
  computed: {
    edgeList: function(){
      const list = []
      this.edges.forEach(d => {
        list.push([d["source"], d["target"]])
      })
      return list
    }
  },
  mounted() {
    if (this.nodes != null && this.edges != null && this.nodes2 != null) {
      this.visualise()
    }
  },
  watch :{
    nodes: function() {
      this.visualise()
    },
     nodes2: function() {
      this.visualise()
    },
    edges: function() {
      this.visualise()
    }
  },
  methods: {
    getState(node) {
      return this.nodes.find(d => d.name === node.data.id).state
    },
    getState2(node) {
      if (this.isChanged(node)) return "(" + this.nodes2.find(d => d.name === node.data.id).state + ")"
      else return ""
    },
    getProbability(node) {
      return this.nodes.find(d => d.name === node.data.id).probability
    },
    isChanged(node) {
      let node1 = this.nodes.find(d => d.name === node.data.id).state
      let node2 = this.nodes2.find(d => d.name === node.data.id).state
      return node1 === node2? 0:1
    },
    visualise() {

      function longName(thisThing, node, d) {
        d3.select(node.target).text(String(thisThing.labels[d.data.id]) + ": ")
      }

      function shortName(thisThing, node, d) {
        console.log("dubs")
        d3.select(node.target).text(String(thisThing.labels[d.data.id]).substring(0, 10) + ": ")
      }

      if (this.nodes !== null && this.edges !== null && this.nodes2 !== null) {

        var graph = dag.dagConnect()(this.edgeList)

        const layout = dag.sugiyama()
            .layering(dag.layeringSimplex())
            .decross(dag.decrossTwoLayer().order(dag.twolayerOpt()))
            .coord(dag.coordCenter())
            .nodeSize((node) => {
              const size = node instanceof dag.SugiDummyNode ? 2 : 12;
              return [size * 3, size * 1.8];
            })

        let {width, height} = layout(graph)

        if (width > height) height = width; else width = height //makes the view quadratic so it fits in our layout


        var color = d3.scaleQuantize()
            .domain([0, 1])
            .range(["black", "red"]);


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
              return `translate(${end.x + 6 * dx / normal}, ${end.y + 6* dy / normal}) rotate(${angle})`;
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
            .attr("height", d => 10*(this.isChanged(d)*0.7+1))
            .attr('fill', "white")
            .attr("stroke-width", 0.5)
            .attr("stroke", d => color(this.isChanged(d)))
            .attr("rx", 2)
            .attr("ry", 2)
            .attr('transform', `translate(-12.5,-4)`)

        // Add text to nodes
        nodes.append('text')
            .text(d => String(this.labels[d.data.id]).substring(0, 10) + ": ")
            .attr("class", "text")
            .attr('text-anchor', 'middle')
            .attr('font-size', '4px')
            .on("mouseenter", (e,d) => longName(this, e, d))
            .on("mouseleave", (e,d) => shortName(this, e, d))

        // Add text to nodes
        nodes.append('text')
            .text(d => String(this.getState(d)).substring(0, 10))
            .attr("class", "text")
            .attr('font-size', '4px')
            .attr('text-anchor', 'middle')
            .attr("dy", 5)

                // Add text to nodes
        nodes.append('text')
            .text(d => String(this.getState2(d)).substring(0, 10))
            .attr("class", "text")
            .attr('font-size', '4px')
            .attr('text-anchor', 'middle')
            .attr("dy", 10)
            .attr('fill', "#6d00bf")


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