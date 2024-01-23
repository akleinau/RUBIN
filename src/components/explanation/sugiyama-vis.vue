<template>
  <div ref="container" class="overflow-hidden"/>
  <div ref="legend" class="absolute w-5" style="left:20px; bottom:20px;"/>

</template>

<script>
import * as d3 from "d3";
import * as dag from "d3-dag"
import {useStore} from '@/store'

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
  setup() {
    const Store = useStore()
    return {Store}
  },
  computed: {
    /**
     * restructures edges to be usable by the sugiyama method
     *
     * @returns {*[]}
     */
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
    /**
     * gets current state of a node
     *
     * @param n
     * @returns {*}
     */
    getState(n) {
      let node = this.nodes.find(d => d.name === n.data.id)
      return this.Store.labels.states[node.name][node.state]
    },
    /**
     * gets probability of current state of a node
     *
     * @param node
     * @returns {string|*}
     */
    getProbability(node) {
      return this.nodes.find(d => d.name === node.data.id).probability
    },

    /**
     * true when node should be fully visible, either in full network view or as one
     * of the highlighted nodes in compact network view
     *
     * @param node
     * @returns {boolean}
     */
    isHighlightNode(node) {
      if (this.highlight) {
        return this.highlightNodes.find(n => n.name === node.data.id) !== undefined
      }
      return true
    },

    /**
     * true when edge should be fully visible, either in full network view or as one
     * of the highlighted nodes in compact network view
     *
     * @param edge
     * @returns {boolean}
     */
    isHighlightEdge(edge) {
      if (this.highlight) {
        return this.highlightEdges.find(e => e.source === edge.data[0] && e.target === edge.data[1]) !== undefined
      }
      return true
    },

    /**
     * displays additional information box when hovered over a node
     *
     * @param e - the hover event
     * @param d - the data of the event
     */
    getDetails(e, d) {
      if (!this.highlight || this.isHighlightNode(d)) {
        //move into focus
        d3.select(e.target.parentNode).raise()
        //size up node
        d3.select(e.target.parentNode).selectAll(".box")
            .attr("width", d => this.Store.labels.nodes[d.data.id].length + 90)
            .attr("height", d => {
              let node = this.nodes.find(node => node.name === d.data.id)
              if (node.distribution) return node.distribution.length * 10 + 15
              else return 15
            })
            .attr("transform", d => `translate(${-(this.Store.labels.nodes[d.data.id].length + 90) / 2},-4)`)
        //show full text
        d3.select(e.target.parentNode).selectAll(".textName").text(d => String(this.Store.labels.nodes[d.data.id]) + ": ")
        // show all probabilities
        d3.select(e.target.parentNode).selectAll(".textState").text(d => String(this.getState(d)))
        d3.select(e.target.parentNode).selectAll(".textState").each(d => {
          let node = this.nodes.find(node => node.name === d.data.id)
          if (node.distribution) {
            node.distribution.forEach((p, i) => {
              d3.select(e.target.parentNode).append("rect")
                  .attr("class", "probBar")
                  .attr("width", p * 20)
                  .attr("height", 5)
                  .attr("transform", `translate(0,${i * 10 + 11})`)
                  .attr("fill", "darkblue")

              d3.select(e.target.parentNode).append("text")
                  .text((p * 100).toFixed(0) + '%')
                  .attr("class", "probText")
                  .attr('font-size', '4px')
                  .attr("transform", `translate(${p * 20 + 2},${i * 10 + 11})`)
                  .attr("fill", "darkblue")
                  .attr("dy", 4)

              d3.select(e.target.parentNode).append("text")
                  .text(this.Store.labels.states[node.name][node.stateNames[i]])
                  .attr("class", "probState")
                  .attr("transform", `translate(-2,${i * 10 + 11})`)
                  .attr('font-size', '4px')
                  .attr('text-anchor', 'end')
                  .attr("dy", 4)
            })
          }

        })
      }

    },

    /**
     * hides additional information box of a node again after the mouse leaves
     *
     * @param e - the event
     */
    hideDetails(e) {
      d3.select(e.target.parentNode).selectAll(".box").attr("width", 25)
          .attr("height", 13)
          .attr("transform", `translate(-12.5,-4)`)

      d3.select(e.target.parentNode).selectAll(".textName").text(d => String(this.Store.labels.nodes[d.data.id]).substring(0, 10) + ": ")
      d3.select(e.target.parentNode).selectAll(".textState").text(d => String(this.getState(d).substring(0, 10)))
      d3.select(e.target.parentNode).selectAll(".probBar").remove()
      d3.select(e.target.parentNode).selectAll(".probState").remove()
      d3.select(e.target.parentNode).selectAll(".probText").remove()
    },

    /**
     * displays network in sugiyama layout
     */
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

        const color = probability => {
          if (probability === 1) return "black"
          else return "mediumblue"
        }


        d3.select(this.$refs.container).selectAll("*").remove()


        var svg = d3.select(this.$refs.container)
            .append("svg")
            .attr("viewBox", [-40, 0, width + 80, height + 100])
            .style("transform-origin", "center")
            .style("display", "inline-box")


        //arrow heads
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

        //edges
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


        //nodes
        const nodes = svg.append('g')
            .selectAll('g')
            .data(graph.descendants())
            .enter()
            .append('g')
            .attr('transform', ({x, y}) => `translate(${x}, ${y})`)


        nodes.append('rect')
            .attr("class", "box")
            .attr("width", 25)
            .attr("height", d => this.isHighlightNode(d) && this.getProbability(d) !== 1 ? 13 : 10)
            .attr('fill', "white")
            .style('stroke-opacity', d => this.isHighlightNode(d) ? 1 : 0.2)
            .attr("stroke-width", 0.4)
            .attr("stroke", d => color(this.getProbability(d)))
            .attr("rx", 2)
            .attr("ry", 2)
            .attr('transform', `translate(-12.5,-4)`)
            .on("mouseenter", (e, d) => this.getDetails(e, d))
            .on("mouseleave", e => this.hideDetails(e))

        // Add variable name to nodes
        nodes.append('text')
            .text(d => String(this.Store.labels.nodes[d.data.id]).substring(0, 10) + ": ")
            .attr("class", "textName")
            .attr('text-anchor', 'middle')
            .attr('font-size', '4px')
            .style('opacity', d => this.isHighlightNode(d) ? 1 : 0)
            .on("mouseenter", (e, d) => this.getDetails(e, d))
            .on("mouseleave", e => this.hideDetails(e))


        // Add variable state to nodes
        nodes.append('text')
            .text(d => String(this.getState(d)).substring(0, 10))
            .attr("class", "textState")
            .attr('font-size', '4px')
            .style('opacity', d => this.isHighlightNode(d) ? 1 : 0)
            .attr('text-anchor', 'middle')
            .attr("dy", 5)
            .on("mouseenter", (e, d) => this.getDetails(e, d))
            .on("mouseleave", e => this.hideDetails(e))

        // Add variable probability to nodes
        nodes.append('rect')
            .attr("class", "mainProbBar")
            .attr("width", 20)
            .attr("height", 1)
            .attr("fill", "lightgray")
            .attr('transform', `translate(-10,7)`)
            .attr("opacity", d => this.getProbability(d) === 1 ? 0 : 1)
            .style('opacity', d => this.isHighlightNode(d) && this.getProbability(d) !== 1 ? 1 : 0)
            .on("mouseenter", (e, d) => this.getDetails(e, d))
            .on("mouseleave", e => this.hideDetails(e))
        nodes.append('rect')
            .attr("class", "mainProbBar")
            .attr("width", d => this.getProbability(d) * 20)
            .attr("height", 1)
            .attr("fill", "slategray")
            .attr('transform', `translate(-10,7)`)
            .style('opacity', d => this.isHighlightNode(d) && this.getProbability(d) !== 1 ? 1 : 0)
            .on("mouseenter", (e, d) => this.getDetails(e, d))
            .on("mouseleave", e => this.hideDetails(e))


        //Zoom
        const zoomed = function ({transform}) {
          svg.style("transform", "translate(" + transform.x + "px," + transform.y + "px) scale(" + transform.k + ")")
          svg.style("transform-origin", "0 0");
        };

        const zoom = d3.zoom().on('zoom', zoomed)
            .extent([[0, 0], [width, height]]) //restricts zoom
            .scaleExtent([1, 10]); //restricts zoom


        d3.select(this.$refs.container).call(zoom)

        this.showLegend()

      }

    },
    /**
     * displays legend
     */
    showLegend() {


      d3.select(this.$refs.legend).selectAll("*").remove()


      var svg = d3.select(this.$refs.legend)
          .append("svg")
          .attr("viewBox", [-3, -10, 120, 40])

       svg.append("rect")
          .attr("width", 90)
          .attr("height", 36)
          .attr('fill', "white")
          .attr("stroke", "darkslategray")
          .attr("stroke-width", 0.4)
          .attr("transform", "translate(-1,-8)")

      svg.append('text')
          .text(this.$t("legend"))
          .attr('text-anchor', 'middle')
          .attr('font-size', '4px')
          .attr('font-style', 'bold')
          .attr("transform", "translate(45,-4)")


      //predicted nodes
      svg.append('text')
          .text(this.$t("predictedNodes"))
          .attr('text-anchor', 'start')
          .attr('font-size', '4px')
          .attr("transform", "translate(2,2)")
          .attr("fill", "darkslategray")

      svg.append("rect")
          .attr("width", 38)
          .attr("height", 22)
          .attr('fill', "white")
          .attr("stroke", "slateblue")
          .attr("stroke-width", 0.4)
          .attr("rx", 2)
          .attr("ry", 2)
          .attr("transform", "translate(2,4)")

      svg.append('text')
          .text(this.$t("nodeName") + ":")
          .attr('text-anchor', 'middle')
          .attr('font-size', '4px')
          .attr("transform", "translate(21,8)")
          .attr("fill", "darkslategray")

      svg.append('text')
          .text(this.$t("state"))
          .attr('text-anchor', 'middle')
          .attr('font-size', '4px')
          .attr("transform", "translate(21,12)")
          .attr("fill", "darkslategray")

      svg.append('rect')
          .attr("width", 20)
          .attr("height", 1)
          .attr("fill", "lightgray")
          .attr('transform', `translate(11,14)`)
      svg.append('rect')
          .attr("width", 15)
          .attr("height", 1)
          .attr("fill", "slategray")
          .attr('transform', `translate(11,14)`)

      svg.append('text')
          .text("0%")
          .attr('text-anchor', 'middle')
          .attr('font-size', '4px')
          .attr("transform", "translate(15,20)")
          .attr("fill", "darkslategray")

      svg.append('text')
          .text("100%")
          .attr('text-anchor', 'middle')
          .attr('font-size', '4px')
          .attr("transform", "translate(27,20)")
          .attr("fill", "darkslategray")

      svg.append('text')
          .text(this.$t("Likeliness"))
          .attr('text-anchor', 'middle')
          .attr('font-size', '4px')
          .attr("transform", "translate(21,24)")
          .attr("fill", "darkslategray")

      //given nodes
      svg.append('text')
          .text(this.$t("givenNodes"))
          .attr('text-anchor', 'start')
          .attr('font-size', '4px')
          .attr("transform", "translate(45,2)")
          .attr("fill", "darkslategray")

      svg.append("rect")
          .attr("width", 38)
          .attr("height", 10)
          .attr('fill', "white")
          .attr("stroke", "black")
          .attr("stroke-width", 0.4)
          .attr("rx", 2)
          .attr("ry", 2)
          .attr("transform", "translate(45,4)")

      svg.append('text')
          .text(this.$t("nodeName") + ":")
          .attr('text-anchor', 'middle')
          .attr('font-size', '4px')
          .attr("transform", "translate(64,8)")
          .attr("fill", "darkslategray")

      svg.append('text')
          .text(this.$t("state"))
          .attr('text-anchor', 'middle')
          .attr('font-size', '4px')
          .attr("transform", "translate(64,12)")
          .attr("fill", "darkslategray")

    }
  }
}


</script>

<style scoped>

</style>