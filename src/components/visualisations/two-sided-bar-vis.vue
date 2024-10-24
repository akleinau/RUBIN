<template>
  <div ref="container"/>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import * as d3 from "d3";
import * as twosidedbarvisjs from "./two-sided-bar-vis-js.ts";

export default defineComponent({
  name: "two-sided-bar-vis",
  props: [
    "value", "direction", "width"
  ],
  mounted() {
    this.visualise()
  },
  methods: {
    /**
     * displays two-sided relevance bar
     */
    visualise() {

      let svg = twosidedbarvisjs.createSVG(this.width, this.value, this.direction)

      d3.select(this.$refs.container).node().append(svg)

    }
  }
})
</script>

<style scoped>

</style>