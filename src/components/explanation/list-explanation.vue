<template>
  <DataTable :value="data" responsiveLayout="scroll" :autoLayout="false" sortField="label" :sortOrder="1"
             class="p-datatable-sm w-full" :scrollable="true" scrollHeight="flex" id="listExplanation">
    <Column :header="$t('Node')" field="label" :sortable="true" class="w-5"/>
    <Column :header="$t('Prediction')" field="state" :sortable="true">
      <template #body="slotProps">
        <div :style="{color:color(slotProps.data.probability)}"> {{ slotProps.data.state }}</div>
      </template>
    </Column>
    <Column :header="$t('Likeliness')" field="probability" :sortable="true">
      <template #body="slotProps">
        <bar v-if="slotProps.data.probability !== 1" :value="slotProps.data.probability" color="slategray"
             :width="150"/>
      </template>
    </Column>
    <Column header="" field="beforeState" v-if="Store.compareConfig">
      <template #body="slotProps">
        <div v-if="slotProps.data.beforeState !== ''">{{ $t("compare") }}: &nbsp;</div>
        <div :style="{color: color(slotProps.data.beforeProb)}"> {{ slotProps.data.beforeState }}</div>
      </template>
    </Column>
  </DataTable>
</template>

<script>
import {useStore} from '@/store'
import bar from "@/components/visualisations/bar-vis.vue";

export default {
  name: "list-explanation",
  components: {
    bar
  },
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
            "label": this.Store.labels.nodes[a.name],
            "state": this.Store.labels.states[a.name][a.state],
            "probability": a.probability,
            "beforeState": "",
            "beforeProb": 0
          })
        })
        return data
      } else {
        let data = []
        this.Store.explain.states.forEach(a => {
          let compareNode = this.Store.compareConfig.explain.states.find(n => n.name === a.name)
          let state_label = this.Store.labels.states[a.name][a.state]
          let compare_state_label = this.Store.labels.states[a.name][compareNode.state]
          data.push({
            "name": a.name,
            "state": state_label,
            "label": this.Store.labels.nodes[a.name],
            "probability": a.probability,
            "beforeState": state_label === compare_state_label ? "" : compare_state_label,
            "beforeProb": state_label === compare_state_label ? 0 : compareNode.probability
          })
        })
        return data
      }
    }
  },
  methods: {
    color(probability) {
      if (probability === 1) return "black"
      return "mediumblue"
    },
    getLabel(probability) {
      if (probability === 1) return this.$t("given")
      return Math.round(probability * 100) + "%"
    }
  }
}
</script>

<style scoped>
.p-chip {
  color: white;
}
</style>