<template>
  <div ref="container"/>
</template>

<script>
import * as d3 from "d3";
import * as twosidedbarvisjs from "@/components/visualisations/two-sided-bar-vis-js.js";

export default {
  name: "two-sided-bar-vis",
  props: [
    "value"
  ],
  mounted() {
    this.visualise()
  },
  methods: {
    visualise() {

      let svg = twosidedbarvisjs.createSVG(300, this.value)

      d3.select(this.$refs.container).node().append(svg)

    }
  }
}
</script>

<style scoped>

</style>