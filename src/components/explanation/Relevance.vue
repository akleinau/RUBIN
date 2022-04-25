<template>
  <div class="p-d-flex p-dir-col">
    <DataTable class="p-col p-datatable-sm" :value="Store.explain.relevance" dataKey="node_name"
      :rowClass="isTherapyRow">
      <Column :header="$t('Node')" field="node_name">
        <template #body="slotProps">
          {{ Store.labels[slotProps.data.node_name] }}: {{getState(slotProps.data.node_name)}}
        </template>
      </Column>
      <Column :header="$t('Relevance')" field="overall_relevance">
        <template #body="slotProps">
          <bar :value="slotProps.data.overall_relevance" color="#004d80" width="200"
               v-tooltip="slotProps.data.overall_relevance.toFixed(2)*100 + '%'"></bar>
        </template>
      </Column>
      <Column v-for="goal in getGoalKeys()" :field="goal" :header="goal" :key="goal">
        <template #body="slotProps">
          <twoSidedBar :value="slotProps.data.relevancies[getIdentifier(goal)]"
                       v-tooltip="getDirectionTooltip(slotProps.data.relevancies[getIdentifier(goal)])"></twoSidedBar>
        </template>
      </Column>
    </DataTable>
<!--    compare view  -->
    <br><br>
    <div class="p-col" v-if="Store.selectedConfig == null">
      <div v-for="goal in getGoalForSummary()" :key="goal" style="fontSize: 2rem">{{ goal }}</div>
    </div>
    <div class="p-col" v-else>
      <h3> {{ Store.selectedConfig.name }}:</h3>
      <DataTable class="p-col p-datatable-sm" :value="Store.selectedConfig.config.explain.relevance" dataKey="node_name"
      :rowClass="isTherapyRow">
      <Column :header="$t('Node')" field="node_name">
        <template #body="slotProps">
          {{ Store.labels[slotProps.data.node_name] }}: {{getCompareState(slotProps.data.node_name)}}
        </template>
      </Column>
      <Column :header="$t('Relevance')" field="overall_relevance">
        <template #body="slotProps">
          <bar :value="slotProps.data.overall_relevance" color="#004d80" width="200"
               v-tooltip="slotProps.data.overall_relevance.toFixed(2)*100 + '%'"></bar>
        </template>
      </Column>
      <Column v-for="goal in getCompareGoalKeys()" :field="goal" :header="goal" :key="goal">
        <template #body="slotProps">
          <twoSidedBar :value="slotProps.data.relevancies[getIdentifier(goal)]"
                       v-tooltip="getDirectionTooltip(slotProps.data.relevancies[getIdentifier(goal)])"></twoSidedBar>
        </template>
      </Column>
    </DataTable>
    </div>
  </div>
</template>

<script>
import bar from "@/components/visualisations/bar";
import twoSidedBar from "@/components/visualisations/twoSidedBar";
import { useStore } from '@/store'

export default {
  name: "Relevance",
  components: {
    bar,
    twoSidedBar
  },
  setup() {
    const Store = useStore()
    return { Store }
  },
  data() {
    return {
      showLocal: false
    }
  },
  methods: {
    getGoalKeys() {
      if (this.Store.newGoals != null) {
        let goalnames = []
        Object.keys(this.Store.newGoals).forEach(goal => {
          goalnames.push(this.Store.labels[goal] + ": " + this.Store.newGoals[goal])
        })

        return goalnames
      }
    },
    getCompareGoalKeys() {
      if (this.Store.selectedConfig != null) {
        let goalnames = []
        Object.keys(this.Store.selectedConfig.config.newGoals).forEach(goal => {
          goalnames.push(this.Store.labels[goal] + ": " + this.Store.selectedConfig.config.newGoals[goal])
        })
        console.log(this.Store.selectedConfig)
        console.log("GoalNames:")
        console.log(goalnames)
        return goalnames
      }
    },
    getGoalForSummary() {
      if (this.Store.newGoals != null && this.Store.options.selectedOption != null) {
        let goalnames = []
        Object.keys(this.Store.newGoals).forEach(goal => {
          let percentage = this.Store.options.selectedOption.goalValues[goal]* 100
          goalnames.push(this.Store.labels[goal] + " - " + this.Store.newGoals[goal] + ": " +
              percentage.toFixed(0) + "%")
        })
        return goalnames
      }
    },
    getDirectionTooltip(number) {
      if (number > 0.001) return this.$t("positiveInfluence")
      else if (number < -0.001) return this.$t("negativeInfluence")
      else return this.$t("noInfluence")
    },
    getIdentifier(label) {
      let identifier = "-1"
      let labelFirstPart = label.split(":")[0]
      Object.entries(this.Store.labels).forEach(([key, value]) => {
        if (value === labelFirstPart) {
          identifier = key
        }
      })
      return identifier + ":" + label.split(":")[1]
    },
    getState(name) {
      let state = "unknown"
      this.Store.explain.states.forEach(node => {
        if (node.name === name) {
          state = node.state
        }
      })
      return state
    },
    getCompareState(name) {
      let state = "unknown"
      this.compareConfig.config.explain.states.forEach(node => {
        if (node.name === name) {
          state = node.state
        }
      })
      return state
    },
    isTherapyRow(row) {
      let rowClass = null
      this.Store.patient.targets.forEach(target => {
         if (target.name === row.node_name) rowClass = "therapy"
        })
      return rowClass
    }
  }
}
</script>

<style scoped lang="scss">
#relevance {
  background-color: white;

}

::v-deep(.smallTable) {
  background-color: rgba(133, 131, 131, 0.15) !important;
}

::v-deep(.therapy) {
    background-color: rgba(55, 55, 55, 0.15) !important;
}

img {
  width: 100%;
}

</style>