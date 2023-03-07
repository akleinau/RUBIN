<template>

  <DataTable :value="data" responsiveLayout="scroll" :autoLayout="false"  sortField="label" :sortOrder="1"
             class="p-datatable-sm w-full" :scrollable="true" scrollHeight="flex" id="listExplanation">
    <Column :header="$t('Node')" field="label" :sortable="true" class="w-5"/>
    <Column :header="$t('Prediction')" field="state"></Column>
    <Column :header="$t('Likeliness')">
      <template #body="slotProps">
        <Chip class="mx-1" :style="{backgroundColor: color(slotProps.data.probability)}"
              :label="getLabel(slotProps.data.probability)"/>
      </template>
    </Column>
    <Column header="" field="beforeState" v-if="Store.compareConfig">
      <template #body="slotProps">
        <div v-if="slotProps.data.beforeState !== ''">compare: &nbsp;</div>
        <div :style="{color: color(slotProps.data.beforeProb)}"> {{ slotProps.data.beforeState }}</div>
      </template>
    </Column>
  </DataTable>

</template>

<script>
import * as d3 from "d3";
import {useStore} from '@/store'

export default {
  name: "list-explanation",
  setup() {
    const Store = useStore()
    return {Store}
  },
  computed: {
    data: function () {
      if (this.Store.explain.states === null) return null
      if (this.Store.compareConfig == null) {
        let data = []
        this.Store.explain.states.forEach(a => {
          data.push({
            "name": a.name,
            "label": this.Store.labels[a.name],
            "state": this.Store.option_labels[a.name][a.state],
            "probability": a.probability,
            "beforeState": "",
            "beforeProb": 0
          })
        })
        console.log(data)
        return data
      } else {
        let data = []
        this.Store.explain.states.forEach(a => {
          let compareNode = this.Store.compareConfig.explain.states.find(n => n.name === a.name)
          let state_label = this.Store.option_labels[a.name][a.state]
          let compare_state_label = this.Store.option_labels[a.name][compareNode.state]
          data.push({
            "name": a.name,
            "state": state_label,
            "label": this.Store.labels[a.name],
            "probability": a.probability,
            "beforeState": state_label === compare_state_label ? "" : compare_state_label,
            "beforeProb": state_label=== compare_state_label ? 0 : compareNode.probability
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
    },
    getLabel(probability) {
      if (probability === 1) return this.$t("given")
      const labelScale = d3.scaleQuantize()
          .domain([0, 1])
          .range([this.$t("notSure"), this.$t("lessSure"), this.$t("verySure")]);
      return labelScale(probability)
    }
  }
}
</script>

<style scoped>
.p-chip {
  color: white;
}
</style>