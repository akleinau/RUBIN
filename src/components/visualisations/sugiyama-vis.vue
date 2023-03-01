<template>
  <div>
    {{ $t('theNetworkIs') }}
    <Chip class="mx-1" style="background-color:green" :label="$t('verySure')"></Chip>
    <Chip class="mx-1" style="background-color:darkgoldenrod" :label="$t('lessSure')"></Chip>
    <Chip class="mx-1" style="background-color:red" :label="$t('notSure')"></Chip>
    , {{ $t('orTheValueIs') }}
    <Chip class="mx-1" style="background-color:black" :label="$t('given')"></Chip>
  </div>

  <div ref="container"  class="overflow-hidden"/>

</template>

<script>
import * as d3 from "d3";
import * as dag from "d3-dag"

export default {
  name: "sugiyama-vis",
  props: [
    "nodes",
    "edges",
    "labels",
    "highlight",
    "highlightNodes",
    "highlightEdges"
  ],
  computed: {
    edgeList: function () {
      const list = []
      if (this.edges) {
        this.edges.forEach(d => {
          list.push([d["source"], d["target"]])
        })
      }

      return list
    }
  },
  mounted() {
    if (this.nodes != null && this.edges != null) {
      this.visualise()
    }
  },
  watch: {
    nodes: function () {
      this.visualise()
    },
    edges: function () {
      this.visualise()
    }
  },
  data() {
    return {}
  },
  methods: {
    getState(node) {
      return this.nodes.find(d => d.name === node.data.id).state
    },
    getProbability(node) {
      return this.nodes.find(d => d.name === node.data.id).probability
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
              let node = this.nodes.find(node => node.name === d.data.id)
              if (node.distribution) return node.distribution.length * 10 + 15
              else return 15
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
                  .attr("fill", "darkblue")

              d3.select(e.target.parentNode).append("text")
                  .text((p * 100).toFixed(0) + '%')
                  .attr("class", "probText")
                  .attr('font-size', '4px')
                  .attr("transform", `translate(${p * 20 + 2},${i * 10 + 10})`)
                  .attr("fill", "darkblue")
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
      }

    },

    hideDetails(e) {
      d3.select(e.target.parentNode).selectAll(".box").attr("width", 25)
          .attr("height", 10)
          .attr("transform", `translate(-12.5,-4)`)

      d3.select(e.target.parentNode).selectAll(".textName").text(d => String(this.labels[d.data.id]).substring(0, 10) + ": ")

      d3.select(e.target.parentNode).selectAll(".probBar").remove()
      d3.select(e.target.parentNode).selectAll(".probState").remove()
      d3.select(e.target.parentNode).selectAll(".probText").remove()
    },

    visualise() {
      if (this.nodes !== null && this.edgeList !== [] && this.edgeList.length !== 0) {

        let edgeColor = this.highlight ? "darkslategray" : "darkgray"

        var graph = dag.dagConnect()(this.edgeList)

        const layout = dag.sugiyama()
            .layering(dag.layeringSimplex())
            .decross(dag.decrossTwoLayer().order(dag.twolayerGreedy().base(dag.twolayerAgg())))
            .coord(dag.coordSimplex())
            .nodeSize((node) => {
              const size = node ? 20 : 3;
              return [1.5 * size, size];
            })

        let {width, height} = layout(graph)

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
            .attr("viewBox", [-40, 0, width + 80, height + 50])
            .style("transform-origin", "center")
            .style("display", "inline-box")


        const arrow = d3.symbol().type(d3.symbolTriangle).size(5);
        svg.append('g')
            .selectAll('path')
            .data(graph.links())
            .enter()
            .append('path')
            .attr('d', arrow)
            .attr('opacity', d => this.isHighlightEdge(d) ? 1 : 0)
            .attr('transform', ({points}) => {
              const [end, start] = points.slice().reverse();
              const dx = start.x - end.x;
              const dy = start.y - end.y;
              const normal = Math.sqrt(dx * dx + dy * dy);
              // This is the angle of the last line segment
              const angle = Math.atan2(-dy, -dx) * 180 / Math.PI + 90;
              const y = Math.abs(angle - 180) > 70 ? 4.5 : 6
              const x = -y * normal / dy
              return `translate(${end.x + x * dx / normal}, ${end.y - y}) rotate(${angle})`;
            })
            .attr('fill', edgeColor)

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
            .attr('stroke-width', 0.8)
            .attr('stroke', edgeColor)
            .attr('opacity', d => this.isHighlightEdge(d) ? 1 : 0.2)
            .on("mouseenter", (e, d) => this.isHighlightEdge(d) ? d3.select(e.target).attr('stroke', "royalblue") : "")
            .on("mouseleave", e => d3.select(e.target).attr('stroke', edgeColor))


        const nodes = svg.append('g')
            .selectAll('g')
            .data(graph.descendants())
            .enter()
            .append('g')
            .attr('transform', ({x, y}) => `translate(${x}, ${y})`)


        nodes.append('rect')
            .attr("class", "box")
            .attr("width", 25)
            .attr("height", 10)
            .attr('fill', "white")
            .style('stroke-opacity', d => this.isHighlightNode(d) ? 1 : 0.2)
            .attr("stroke-width", 0.5)
            .attr("stroke", d => color(this.getProbability(d)))
            .attr("rx", 2)
            .attr("ry", 2)
            .attr('transform', `translate(-12.5,-4)`)
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
            .style('opacity', d => this.isHighlightNode(d) ? 1 : 0)
            .attr('text-anchor', 'middle')
            .attr("dy", 5)
            .on("mouseenter", (e, d) => this.getDetails(e, d))
            .on("mouseleave", e => this.hideDetails(e))

        //Zoom
        var zoomed = function ({transform}) {
          svg.style("transform",  "translate(" + transform.x + "px," + transform.y + "px) scale(" + transform.k + ")")
        }

        var zoom = d3.zoom().on('zoom', zoomed)
            .extent([[0,0], [width, height]])
            .scaleExtent ([1, 10])

        d3.select(this.$refs.container).call(zoom)


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