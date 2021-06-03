<template style="position:relative">
  <div>
    The network is:
    <Chip  class="p-mx-1" style="background-color:green" label="very sure"> </Chip>
    <Chip  class="p-mx-1" style="background-color:darkgoldenrod" label="less sure"></Chip>
    <Chip  class="p-mx-1" style="background-color:red" label="not sure"></Chip>
    , or the value is
    <Chip  class="p-mx-1" style="background-color:black" label="given"> </Chip>
  </div>
<DataTable :value="data" :scrollable="true" scrollHeight="600px">
  <Column header="node" field="name" :sortable="true" />
  <Column header="prediction" field="state"></Column>
  <Column header="likeliness">
    <template #body="slotProps">
          <i class="pi pi-circle-on p-ml-3" :style="{color: color(slotProps.data.probability)}"></i>
    </template>
  </Column>
   <Column header="" field="beforeState" v-if="compareConfig">
    <template #body="slotProps">
      <div v-if="slotProps.data.beforeState !== ''">{{compareConfig.name}}: &nbsp; </div>
      <div :style="{color: color(slotProps.data.beforeProb)}">  {{slotProps.data.beforeState}} </div>
    </template>
  </Column>
</DataTable>
</template>

<script>
import * as d3 from "d3";
export default {
name: "NodeList",
  props: [
      "nodes",
      "compareConfig"
  ],
  data() {
  return {
    c1: "blue"
  }
  },
  computed: {
     data: function () {
        if (this.nodes === null) return null
        if (this.compareConfig == null) {
          let data = []
          this.nodes.forEach(a => {
            data.push({
              "name": a.name,
              "state": a.state,
              "probability": a.probability,
              "beforeState": "",
              "beforeProb": 0
            })
          })
          return data
        }
        else {
          let data = []
          this.nodes.forEach( a => {
            let compareNode = this.compareConfig.config.explain.states.find(n => n.name === a.name)
            data.push({
              "name": a.name,
              "state": a.state,
              "probability": a.probability,
              "beforeState": a.state === compareNode.state ? "" : compareNode.state,
              "beforeProb": a.state === compareNode.state ? 0 : compareNode.probability
            })
          })
          return data
        }
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