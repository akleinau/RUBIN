<template>
  in <span style="border:1px solid red; border-radius:5px"> changed nodes</span> the different states are color coded:
  <Chip class="mx-1" style="background-color:black" label="current"></Chip>
  <Chip class="mx-1" style="background-color:#6d00bf" label="compare"></Chip>
  <div ref="container"/>
</template>

<script>
import * as d3 from "d3";
import * as dag from "d3-dag"

export default {
  name: "sugiyama-vis-compare",
  props: [
    "nodes",
    "edges",
    "nodes2",
    "labels",
    "highlight",
    "highlightNodes",
    "highlightEdges"
  ],
  computed: {
    edgeList: function () {
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
  watch: {
    nodes: function () {
      this.visualise()
    },
    nodes2: function () {
      this.visualise()
    },
    edges: function () {
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
      return node1 === node2 ? 0 : 1
    },

    isHighlightNode(node) {
      if (this.highlight) {
        return this.highlightNodes.find(n => n.name === node.data.id) !== undefined
      }
      return true
    },

    isHighlightEdge(edge) {
      if (this.highlight) {
        return this.highlightEdges.find(e => e.source === edge.data[0] && e.target === edge.data[1]) !== undefined
      }
      return true
    },

    getDetails(e, d) {
      if (!this.highlight || this.isHighlightNode(d)) {
        //move into focus
        d3.select(e.target.parentNode).raise()
        //size up node
        d3.select(e.target.parentNode).selectAll(".box")
            .attr("width", d => this.labels[d.data.id].length + 60)
            .attr("height", d => {
              let height = 15
              let node = this.nodes.find(node => node.name === d.data.id)
              if (node.distribution) height = node.distribution.length * 10 + 15
              let node2 = this.nodes2.find(node => node.name === d.data.id)
              if (node2.distribution) height += node2.distribution.length * 10 + 10
              return height
            })
            .attr("transform", d => `translate(${-(this.labels[d.data.id].length + 60) / 2},-4)`)
        //show full text
        d3.select(e.target.parentNode).selectAll(".textName").text(d => String(this.labels[d.data.id]) + ": ")
        // show all probabilities
        d3.select(e.target.parentNode).selectAll(".textState").each(d => {
          let node = this.nodes.find(node => node.name === d.data.id)
          if (node.distribution) {
            node.distribution.forEach((p, i) => {
              d3.select(e.target.parentNode).append("rect")
                  .attr("class", "probBar")
                  .attr("width", p * 20)
                  .attr("height", 5)
                  .attr("transform", `translate(0,${i * 10 + 10})`)
                  .attr("fill", "black")

              d3.select(e.target.parentNode).append("text")
                  .text((p * 100).toFixed(0) + '%')
                  .attr("class", "probText")
                  .attr('font-size', '4px')
                  .attr("transform", `translate(${p * 20 + 2},${i * 10 + 10})`)
                  .attr("fill", "black")
                  .attr("dy", 4)

              d3.select(e.target.parentNode).append("text")
                  .text(node.stateNames[i])
                  .attr("class", "probState")
                  .attr("transform", `translate(-2,${i * 10 + 10})`)
                  .attr('font-size', '4px')
                  .attr('text-anchor', 'end')
                  .attr("dy", 4)
            })
          }

        })

        d3.select(e.target.parentNode).selectAll(".textState2").each(d => {
          let node = this.nodes2.find(node => node.name === d.data.id)
          let nodeCompare = this.nodes.find(node => node.name === d.data.id)
          if (node.distribution) {
            let displacement = (nodeCompare.distribution) ? nodeCompare.distribution.length * 10 + 10 : 10
            d3.select(e.target.parentNode).selectAll(".textState2")
                .attr("dy", displacement + 5)
                .text("compare: " + String(this.getState2(d)))


            node.distribution.forEach((p, i) => {
              d3.select(e.target.parentNode).append("rect")
                  .attr("class", "probBar")
                  .attr("width", p * 20)
                  .attr("height", 5)
                  .attr("transform", `translate(0,${displacement + i * 10 + 10})`)
                  .attr("fill", "#6d00bf")

              d3.select(e.target.parentNode).append("text")
                  .text((p * 100).toFixed(0) + '%')
                  .attr("class", "probText")
                  .attr('font-size', '4px')
                  .attr("transform", `translate(${p * 20 + 2},${displacement + i * 10 + 10})`)
                  .attr("fill", "#6d00bf")
                  .attr("dy", 4)

              d3.select(e.target.parentNode).append("text")
                  .text(node.stateNames[i])
                  .attr("class", "probState")
                  .attr("transform", `translate(-2,${displacement + i * 10 + 10})`)
                  .attr('font-size', '4px')
                  .attr('text-anchor', 'end')
                  .attr("fill", "#6d00bf")
                  .attr("dy", 4)
            })
          }

        })
      }

    },

    hideDetails(e) {
      d3.select(e.target.parentNode).selectAll(".box").attr("width", 25)
          .attr("height", d => 10 * (this.isChanged(d) * 0.5 + 1))
          .attr("transform", `translate(-12.5,-4)`)

      d3.select(e.target.parentNode).selectAll(".textName").text(d => String(this.labels[d.data.id]).substring(0, 10) + ": ")

      d3.select(e.target.parentNode).selectAll(".textState2")
          .attr("dy", 10)
          .text(d => String(this.getState2(d)).substring(0, 10))
      d3.select(e.target.parentNode).selectAll(".probBar").remove()
      d3.select(e.target.parentNode).selectAll(".probState").remove()
      d3.select(e.target.parentNode).selectAll(".probText").remove()
    },

    visualise() {

      if (this.nodes !== null && this.edgeList !== null && this.edgeList.length !== 0 && this.nodes2 !== null) {

        var graph = dag.dagConnect()(this.edgeList)

        const layout = dag.sugiyama()
            .layering(dag.layeringSimplex())
            .decross(dag.decrossTwoLayer().order(dag.twolayerGreedy().base(dag.twolayerAgg())))
            .coord(dag.coordSimplex())
            .nodeSize((node) => {
              const size = node ? 20 : 3;
              return [1.5* size , size];
            })

        let {width, height} = layout(graph)

        var color = d3.scaleQuantize()
            .domain([0, 1])
            .range(["black", "red"]);


        d3.select(this.$refs.container).selectAll("*").remove()

        var svg = d3.select(this.$refs.container)
            .append("svg")
            .attr("viewBox", [-40, 0, width + 80, height + 50])

        const arrow = d3.symbol().type(d3.symbolTriangle).size(5);
        svg.append('g')
            .selectAll('path')
            .data(graph.links())
            .enter()
            .append('path')
            .attr('opacity', d => this.isHighlightEdge(d) ? 1 : 0)
            .attr('d', arrow)
            .attr('transform', ({points}) => {
              const [end, start] = points.slice().reverse();
              // This sets the arrows the node radius (20) + a little bit (3) away from the node center, on the last line segment of the edge. This means that edges that only span ine level will work perfectly, but if the edge bends, this will be a little off.
              const dx = start.x - end.x;
              const dy = start.y - end.y;
              const normal = Math.sqrt(dx * dx + dy * dy);
              // This is the angle of the last line segment
              const angle = Math.atan2(-dy, -dx) * 180 / Math.PI + 90;
              return `translate(${end.x + 6 * dx / normal}, ${end.y + 6 * dy / normal}) rotate(${angle})`;
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
            .attr('opacity', d => this.isHighlightEdge(d) ? 1 : 0.2)


        const nodes = svg.append('g')
            .selectAll('g')
            .data(graph.descendants())
            .enter()
            .append('g')
            .attr('transform', ({x, y}) => `translate(${x}, ${y})`)

        nodes.append('rect')
            .attr("class", "box")
            .attr("width", 25)
            .attr("height", d => 10 * (this.isChanged(d) * 0.5 + 1))
            .attr('fill', "white")
            .attr("stroke-width", 0.5)
            .attr("stroke", d => color(this.isChanged(d)))
            .attr("rx", 2)
            .attr("ry", 2)
            .attr('transform', `translate(-12.5,-4)`)
            .style('stroke-opacity', d => this.isHighlightNode(d) ? 1 : 0.2)
            .on("mouseenter", (e, d) => this.getDetails(e, d))
            .on("mouseleave", e => this.hideDetails(e))

        // Add text to nodes
        nodes.append('text')
            .text(d => String(this.labels[d.data.id]).substring(0, 10) + ": ")
            .attr("class", "textName")
            .attr('text-anchor', 'middle')
            .attr('font-size', '4px')
            .style('opacity', d => this.isHighlightNode(d) ? 1 : 0)
            .on("mouseenter", (e, d) => this.getDetails(e, d))
            .on("mouseleave", e => this.hideDetails(e))

        // Add text to nodes
        nodes.append('text')
            .text(d => String(this.getState(d)).substring(0, 10))
            .attr("class", "textState")
            .attr('font-size', '4px')
            .attr('text-anchor', 'middle')
            .attr("dy", 5)
            .style('opacity', d => this.isHighlightNode(d) ? 1 : 0)
            .on("mouseenter", (e, d) => this.getDetails(e, d))
            .on("mouseleave", e => this.hideDetails(e))

        // Add text to nodes
        nodes.append('text')
            .text(d => String(this.getState2(d)).substring(0, 10))
            .attr("class", "textState2")
            .attr('font-size', '4px')
            .attr('text-anchor', 'middle')
            .style('opacity', d => this.isHighlightNode(d) ? 1 : 0)
            .attr("dy", 10)
            .attr('fill', "#6d00bf")
            .on("mouseenter", (e, d) => this.getDetails(e, d))
            .on("mouseleave", e => this.hideDetails(e))


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