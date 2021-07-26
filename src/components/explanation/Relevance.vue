<template>
  <div class="p-d-flex p-dir-col">
    <DataTable class="p-col p-datatable-sm" :value="relevance" v-model:expandedRows="expandedRows" dataKey="node_name">
      <Column :expander="true" headerStyle="width: 3rem"/>
      <Column :header="$t('Node')" field="node_name">
        <template #body="slotProps">
          {{ labels[slotProps.data.node_name] }}: {{getState(slotProps.data.node_name)}}
        </template>
      </Column>
      <Column :header="$t('Relevance')" field="overall_relevance">
        <template #body="slotProps">
          <bar :value="slotProps.data.overall_relevance" color="#004d80" width="300"
               v-tooltip="slotProps.data.overall_relevance.toFixed(2)*100 + '%'"></bar>
        </template>
      </Column>
      <template #expansion="slotProps">
        <DataTable :value="getGoalKeys()" :key="goal" :rowClass="() => 'smallTable'">
          <Column :header="$t('goalInfluence')">
            <template #body="currGoal">
              {{ currGoal.data }}
            </template>
          </Column>
          <Column>
            <template #body="currGoal">
              <twoSidedBar :value="slotProps.data.relevancies[getIdentifier(currGoal.data)]"
                           v-tooltip="getDirectionTooltip(slotProps.data.relevancies[getIdentifier(currGoal.data)])"></twoSidedBar>
            </template>
          </Column>
        </DataTable>
      </template>
    </DataTable>
    <br><br>
    <div class="p-col" v-if="compareConfig == null">
      <div v-for="goal in getGoalForSummary()" :key="goal" style="fontSize: 2rem">{{ goal }}</div>
    </div>
    <div class="p-col" v-else>
      <h3> {{ compareConfig.name }}:</h3>
      <DataTable class="p-col p-datatable-sm" :value="compareConfig.config.explain.relevance" v-model:expandedRows="compareExpandedRows">
        <Column :expander="true" headerStyle="width: 3rem"/>
        <Column :header="$t('Node')" field="node_name">
          <template #body="slotProps">
            {{ labels[slotProps.data.node_name] }}
          </template>
        </Column>
        <Column :header="$t('Relevance')" field="overall_relevance">
          <template #body="slotProps">
            <bar :value="slotProps.data.overall_relevance" color="#004d80" width="300"
                 v-tooltip="slotProps.data.overall_relevance.toFixed(2)*100 + '%'"></bar>
          </template>
        </Column>
        <template #expansion="slotProps">
        <DataTable :value="getGoalKeys()" :key="goal" :rowClass="() => 'smallTable'">
          <Column :header="$t('goalInfluence')">
            <template #body="currGoal">
              {{ currGoal.data }}
            </template>
          </Column>
          <Column>
            <template #body="currGoal">
              <twoSidedBar :value="slotProps.data.relevancies[getIdentifier(currGoal.data)]"
                           v-tooltip="getDirectionTooltip(slotProps.data.relevancies[getIdentifier(currGoal.data)])"></twoSidedBar>
            </template>
          </Column>
        </DataTable>
      </template>
      </DataTable>
    </div>
  </div>
</template>

<script>
import bar from "@/components/visualisations/bar";
import twoSidedBar from "@/components/visualisations/twoSidedBar";

export default {
  name: "Relevance",
  components: {
    bar,
    twoSidedBar
  },
  props: [
    "relevance",
    "goals",
    "nodes",
    "compareConfig",
    "selectedOption",
    "labels"
  ],
  data() {
    return {
      showLocal: false,
      expandedRows: [],
      compareExpandedRows: []
    }
  },
  methods: {
    getGoalKeys() {
      if (this.goals != null) {
        let goalnames = []
        Object.keys(this.goals).forEach(goal => {
          goalnames.push(this.labels[goal] + ": " + this.goals[goal])
        })

        return goalnames
      }
    },
    getGoalForSummary() {
      if (this.goals != null && this.selectedOption != null) {
        let goalnames = []
        Object.keys(this.goals).forEach(goal => {
          let percentage = this.selectedOption.goalValues[goal]* 100
          goalnames.push(this.labels[goal] + " - " + this.goals[goal] + ": " +
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
      Object.entries(this.labels).forEach(([key, value]) => {
        if (value === labelFirstPart) {
          identifier = key
        }
      })
      return identifier + ":" + label.split(":")[1]
    },
    getState(name) {
      let state = "unknown"
      this.nodes.forEach(node => {
        if (node.name === name) {
          state = node.state
        }
      })
      return state
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

img {
  width: 100%;
}

</style>