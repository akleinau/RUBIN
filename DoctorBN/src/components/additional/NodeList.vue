<template>
<DataTable :value="nodes">
  <Column header="node" field="name" />
  <Column header="state" field="state">
    <template #body="slotProps">
      <div :style="{color: color(slotProps.data.probability)}"> {{slotProps.data.state}} </div>
    </template>
  </Column>
</DataTable>
</template>

<script>
import * as d3 from "d3";
export default {
name: "NodeList",
  props: [
      "nodes"
  ],
  data() {
  return {
    c1: "blue"
  }
  },
  methods: {
    color(probability) {
      if (probability === 1) return "black"
      const colorScale = d3.scaleQuantize()
            .domain([0, 1])
             .range(["red", "chocolate", "darkGoldenRod", "yellowgreen", "green"]);
        return colorScale(probability)
    }
  }
}
</script>

<style scoped>

</style>