<template>
<div ref="container"/>
</template>

<script>
import * as d3 from "d3";

export default {
name: "sugiyama",
  data() {
    return {
      exEdges: [
        {"target": "a", "source": "b"},
        {"target": "a", "source": "c"}
      ]
    }
  },
  methods: {
    visualise() {
      const width = 450
      const height = 110

      let links = this.exNodes
      let nodes = this.exEdges


      d3.select(this.$refs.container).selectAll("*").remove()

      var svg = d3.select(this.$refs.container)
          .append("svg")
          .attr("viewBox", [0, 0, width, height]);



    }
  }
}



</script>

<style scoped>

</style>