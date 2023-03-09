<template>
    <DataTable class="w-full p-datatable-sm" :value="table"
               rowGroupMode="subheader" groupRowsBy="config_name"
               responsiveLayout="scroll" :scrollable="true" scrollHeight="flex"
               :rowClass="isTherapyRow"  id="relevanceExplanation">

      <template #groupheader="slotProps">
        <br>
        <b v-if="Store.compareConfig">{{ slotProps.data.config_name }}:</b>
      </template>

      <ColumnGroup type="header">
        <Row>
          <Column header="" field="node_name" :rowspan="2"/>
          <Column :header="$t('Relevance')" field="overall_relevance" :rowspan="2"/>
          <Column :header="$t('localRelevance')" :colspan="getGoalKeyNum()"></Column>
        </Row>
        <Row>
          <Column v-for="goal in goalnames" :field="goal" :header="goal.label" :key="goal"/>
        </Row>
      </ColumnGroup>

      <Column :header="$t('Node')" field="node_name" :rowspan="2">
        <template #body="slotProps">
          <div :class="{ highlightCompare: isDifferentName(slotProps.data) }">
            {{ slotProps.data.label }}:
            <span :class="{highlightCompare: isDifferentState(slotProps.data)}">
                {{ slotProps.data.state }}
            </span>
          </div>
        </template>
      </Column>
      <Column :header="$t('Relevance')" field="overall_relevance" :rowspan="2">
        <template #body="slotProps">
          <bar :value="slotProps.data.overall_relevance" color="#004d80" width="200"
               v-tooltip="(slotProps.data.overall_relevance*100).toFixed(0) + '%'"></bar>
        </template>
      </Column>
      <Column v-for="goal in goalnames" :key="goal">
        <template #body="slotProps">
          <twoSidedBar :value="slotProps.data.relevancies[getIdentifier(goal.name)]"
                       v-tooltip.left="{value: getDirectionTooltip(slotProps.data.relevancies[getIdentifier(goal.name)],
                       goal.direction, goal.label), fitContent: true}"
          />
        </template>
      </Column>
    </DataTable>

</template>

<script>
import bar from "@/components/visualisations/bar-vis";
import twoSidedBar from "@/components/visualisations/two-sided-bar-vis";
import {useStore} from '@/store'

export default {
  name: "relevance-explanation",
  components: {
    bar,
    twoSidedBar
  },
  setup() {
    const Store = useStore()
    return {Store}
  },
  data() {
    return {
      showLocal: false,
    }
  },
  computed: {
    goalnames: function () {
      let goalnames = []
      if (this.Store.patient.goals != null && this.Store.explain.relevance != null) {
        this.Store.patient.goals.forEach(goal => {
          goalnames.push({
            "name": this.Store.labels[goal.name] + ": " + this.Store.option_labels[goal.name][goal.selected.name],
            "label": this.Store.labels[goal.name] + ": " + this.Store.option_labels[goal.name][goal.selected.name],
            "direction": goal.direction
          })
        })
      }
      return goalnames
    },

    table: function () {
      if (this.Store.explain.relevance) {
        let table = []
        this.Store.explain.relevance.forEach(n => {
          table.push({
            config_name: "current",
            label: this.Store.labels[n.node_name],
            node_name: n.node_name,
            state: this.getState(n.node_name),
            overall_relevance: n.overall_relevance,
            relevancies: n.relevancies
          })
        })

        //compare
        if (this.Store.compareConfig != null) {
          this.Store.compareConfig.explain.relevance.forEach(n => {
            table.push({
              config_name: "compare",
              label: this.Store.labels[n.node_name],
              node_name: n.node_name,
              state: this.getCompareState(n.node_name),
              overall_relevance: n.overall_relevance,
              relevancies: n.relevancies
            })
          })
        }

        return table
      } else return []
    }
  },
  methods: {
    getGoalKeyNum() {
      if (this.Store.patient.goals != null) {
        return this.Store.patient.goals.length
      } else {
        return 0
      }
    },
    getDirectionTooltip(number, direction, label) {
      if (direction === "min") {
        if (number > 0.001) return "Decreases the probability of " + label
        else if (number < -0.001) return "Increases the probability of " + label
      }
      if (direction === "max") {
        if (number > 0.001) return "Increases the probability of " + label
        else if (number < -0.001) return "Decreases the probability of " + label
      }

      return this.$t("noInfluence")
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
          state = this.Store.option_labels[name][node.state]
        }
      })
      return state
    },
    getCompareState(name) {
      let state = "unknown"
      this.Store.compareConfig.explain.states.forEach(node => {
        if (node.name === name) {
          state = this.Store.option_labels[name][node.state]
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
    },
    isDifferentName(row) {
      if (row.config_name === "compare") {
        return !this.Store.explain.relevance.find(a => a.node_name === row.node_name);
      }
      if (this.Store.compareConfig !== null) {
        return !this.Store.compareConfig.explain.relevance.find(a => a.node_name === row.node_name)
      }
      return false
    },
    isDifferentState(row) {
      if (row.config_name === "compare") {
        let node = this.Store.explain.relevance.find(a => a.node_name === row.node_name)
        if (node === undefined) return true
        return this.getState(node.node_name) !== this.getCompareState(row.node_name);
      }
      if (this.Store.compareConfig !== null) {
        let node = this.Store.compareConfig.explain.relevance.find(a => a.node_name === row.node_name)
        if (node === undefined) return true
        return this.getState(row.node_name) !== this.getCompareState(node.node_name);
      }
      return false

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

.highlightCompare {
  color: darkviolet;
}

</style>