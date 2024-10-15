<template>
  <div ref="container"/>
</template>

<script>
import * as d3 from "d3";
import * as barvisjs from "./bar-vis-js.js";

export default {
  name: "bar-vis",
  props: [
    "value",
    "color",
    "width"
  ],
  mounted() {
    this.visualise()
  },
  watch: {
    value: function () {
      this.visualise()
    },
    color: function () {
      this.visualise()
    }
  },
  methods: {
    /**
     * displays percentage bar
     */
    visualise() {

      let svg = barvisjs.createSVG(this.width, this.value, this.color)

      d3.select(this.$refs.container).selectAll("*").remove()
      d3.select(this.$refs.container).node().append(svg)

    }
  }
}
</script>

<style scoped>

</style>