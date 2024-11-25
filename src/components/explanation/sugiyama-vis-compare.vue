<template>
  <div ref="container" class="overflow-hidden"/>
  <div ref="legend" class="absolute w-5" style="left:20px; bottom:20px;"/>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import * as d3 from "d3";
import * as dag from "d3-dag"
import {useStore} from '../../store.ts';
import {Edge} from "../../types/explanation_types.ts";

export default defineComponent({
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
      const list: any[] = []
      this.edges.forEach((d: any) => {
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
     * gets state of the compare node, if it is different from current state
     *
     * @param n
     * @returns {*}
     */
    getState2(n) {
      let node = this.nodes2.find(d => d.name === n.data.id)
      return "(" +  this.Store.labels.states[node.name][node.state] + ")"
    },
    /**
     * returns 1 when the current and compare state are different, else 0
     *
     * @param node
     * @returns {number}
     */
    isChanged(node: any) {
      let node1 = this.nodes.find(d => d.name === node.data.id).state
      let node2 = this.nodes2.find(d => d.name === node.data.id).state
      return node1 === node2 ? 0 : 1
    },
    /**
     * true when node should be fully visible, either in full network view or as one
     * of the highlighted nodes in compact network view
     *
     * @param node
     * @returns {boolean}
     */
    isHighlightNode(node: any) {
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
    isHighlightEdge(edge: any) : boolean {
      if (this.highlight) {
        return this.highlightEdges.find((e: Edge) => e.source === edge.data[0] && e.target === edge.data[1]) !== undefined
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
              let height = 15 //for title
              let node = this.nodes.find(node => node.name === d.data.id)
              if (node.distribution) height = node.distribution.length * 10 + 15 //for current bars and spacing
              let node2 = this.nodes2.find(node => node.name === d.data.id)
              if (node2.distribution) height += node2.distribution.length * 10 //for compare bars
              height += 10 //for compare title
              return height
            })
            .attr("transform", d => `translate(${-(this.Store.labels.nodes[d.data.id].length + 90) / 2},-4)`)
        //show full text
        d3.select(e.target.parentNode).selectAll(".textName").text(d => String(this.Store.labels.nodes[d.data.id]) + ": ")
        d3.select(e.target.parentNode).selectAll(".textState")
          .text(d => String(this.getState(d)))
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
                  .text(this.Store.labels.states[node.name][node.stateNames[i]])
                  .attr("class", "probState")
                  .attr("transform", `translate(-2,${i * 10 + 10})`)
                  .attr('font-size', '4px')
                  .attr('text-anchor', 'end')
                  .attr("dy", 4)
            })
          }

        })

        //show probabilities of compare node
        d3.select(e.target.parentNode).selectAll(".textState2").each(d => {
          let node = this.nodes2.find(node => node.name === d.data.id)
          let nodeCurrent = this.nodes.find(node => node.name === d.data.id)

          let displacement = (nodeCurrent.distribution) ? nodeCurrent.distribution.length * 10 + 10 : 10
          d3.select(e.target.parentNode).selectAll(".textState2")
              .attr("dy", displacement + 5)
              .text(this.$t('compare') + ": " + String(this.getState2(d)))

          if (node.distribution) {

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
                  .text(this.Store.labels.states[node.name][node.stateNames[i]])
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

    /**
     * hides additional information box of a node again after the mouse leaves
     *
     * @param e - the event
     */
    hideDetails(e: any) {
      d3.select(e.target.parentNode).selectAll(".box").attr("width", 25)
          .attr("height", d => 10 * (this.isChanged(d) * 0.5 + 1))
          .attr("transform", `translate(-12.5,-4)`)

      d3.select(e.target.parentNode).selectAll(".textName").text(d => String(this.Store.labels.nodes[d.data.id]).substring(0, 10) + ": ")

      d3.select(e.target.parentNode).selectAll(".textState")
          .text(d => String(this.getState(d)).substring(0, 10))

      d3.select(e.target.parentNode).selectAll(".textState2")
          .attr("dy", 10)
          .text(d => String(this.isChanged(d) ? this.getState2(d) : "").substring(0, 10))
      d3.select(e.target.parentNode).selectAll(".probBar").remove()
      d3.select(e.target.parentNode).selectAll(".probState").remove()
      d3.select(e.target.parentNode).selectAll(".probText").remove()
    },

    /**
     * displays network in sugiyama layout
     */
    visualise() {

      if (this.nodes !== null && this.edgeList !== null && this.edgeList.length !== 0 && this.nodes2 !== null) {

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

        var color = d3.scaleQuantize()
            .domain([0, 1])
            .range(["gray", "red"]);


        d3.select(this.$refs.container).selectAll("*").remove()

        var svg = d3.select(this.$refs.container)
            .append("svg")
            .attr("viewBox", [-40, 0, width + 80, height + 100])

        //arrow heads
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
            .attr("height", d => 10 * (this.isChanged(d) * 0.5 + 1))
            .attr('fill', "white")
            .attr("stroke-width", 0.4)
            .attr("stroke", d => color(this.isChanged(d)))
            .attr("rx", 2)
            .attr("ry", 2)
            .attr('transform', `translate(-12.5,-4)`)
            .style('stroke-opacity', d => this.isHighlightNode(d) ? 1 : 0.2)
            .on("mouseenter", (e, d) => this.getDetails(e, d))
            .on("mouseleave", e => this.hideDetails(e))

        // Add text to nodes
        nodes.append('text')
            .text(d => String(this.Store.labels.nodes[d.data.id]).substring(0, 10) + ": ")
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
            .text(d => String(this.isChanged(d) ? this.getState2(d) : "").substring(0, 10))
            .attr("class", "textState2")
            .attr('font-size', '4px')
            .attr('text-anchor', 'middle')
            .style('opacity', d => this.isHighlightNode(d) ? 1 : 0)
            .attr("dy", 10)
            .attr('fill', "#6d00bf")
            .on("mouseenter", (e, d) => this.getDetails(e, d))
            .on("mouseleave", e => this.hideDetails(e))

        //Zoom
        const zoomed = function ({transform}) {
          svg.style("transform", "translate(" + transform.x + "px," + transform.y + "px) scale(" + transform.k + ")")
          svg.style("transform-origin", "0 0");
        }

        const zoom = d3.zoom().on('zoom', zoomed)
            .extent([[0, 0], [width, height]])
            .scaleExtent([1, 10])

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


      //unchanged nodes
      svg.append('text')
          .text(this.$t("unchangedNodes"))
          .attr('text-anchor', 'start')
          .attr('font-size', '4px')
          .attr("transform", "translate(2,2)")
          .attr("fill", "darkslategray")

      svg.append("rect")
          .attr("width", 38)
          .attr("height", 10)
          .attr('fill', "white")
          .attr("stroke", "gray")
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

      //changed nodes
      svg.append('text')
          .text(this.$t("changedNodes"))
          .attr('text-anchor', 'start')
          .attr('font-size', '4px')
          .attr("transform", "translate(40,2)")
          .attr("fill", "darkslategray")

      svg.append("rect")
          .attr("width", 38)
          .attr("height", 14)
          .attr('fill', "white")
          .attr("stroke", "red")
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
          .text(this.$t("currentState"))
          .attr('text-anchor', 'middle')
          .attr('font-size', '4px')
          .attr("transform", "translate(64,12)")
          .attr("fill", "darkslategray")

      svg.append('text')
          .text("(" + this.$t("compareState") + ")")
          .attr('text-anchor', 'middle')
          .attr('font-size', '4px')
          .attr("transform", "translate(64,16)")
          .attr("fill", "#6d00bf")

    }
  }
})


</script>

<style scoped>

</style>