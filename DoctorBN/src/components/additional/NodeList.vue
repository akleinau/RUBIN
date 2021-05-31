<template style="position:relative">
      <div>
    The network is:
    <Chip  class="p-mx-1" style="background-color:black" label="sure"> </Chip>
    <Chip  class="p-mx-1" style="background-color:green" label="very sure"> </Chip>
    <Chip  class="p-mx-1" style="background-color:darkgoldenrod" label="less sure"></Chip>
    <Chip  class="p-mx-1" style="background-color:red" label="not sure"></Chip>
    with it's prognosis
  </div>
<DataTable :value="nodes" :scrollable="true" scrollHeight="600px">
  <Column header="node" field="name" :sortable="true" />
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
             .range(["red", "darkGoldenRod", "green"]);
        return colorScale(probability)
    }
  }
}
</script>

<style scoped>
.p-chip {
  color: white;
}
</style>