<template>
  <div>
    <DataTable class=" p-datatable-sm" :value="Store.explain.relevance"
               :rowClass="isTherapyRow">
      <ColumnGroup type="header">
        <Row>
          <Column header="" field="node_name" :rowspan="2"/>
          <Column :header="$t('Relevance')" field="overall_relevance" :rowspan="2"/>
          <Column header="Influence on Outcome" :colspan="getGoalKeyNum()"></Column>
        </Row>
        <Row>
          <Column v-for="goal in goalnames" :field="goal" :header="goal" :key="goal"/>
        </Row>
      </ColumnGroup>

      <Column :header="$t('Node')" field="node_name" :rowspan="2">
        <template #body="slotProps">
          {{ Store.labels[slotProps.data.node_name] }}: {{ getState(slotProps.data.node_name) }}
        </template>
      </Column>
      <Column :header="$t('Relevance')" field="overall_relevance" :rowspan="2">
        <template #body="slotProps">
          <bar :value="slotProps.data.overall_relevance" color="#004d80" width="200"
               v-tooltip="slotProps.data.overall_relevance.toFixed(2)*100 + '%'"></bar>
        </template>
      </Column>
      <Column v-for="goal in goalnames" :field="goal" :header="goal" :key="goal">
        <template #body="slotProps">
          <twoSidedBar :value="slotProps.data.relevancies[getIdentifier(goal)]"
                       v-tooltip="getDirectionTooltip(slotProps.data.relevancies[getIdentifier(goal)])"></twoSidedBar>
        </template>
      </Column>
    </DataTable>

    <!--    compare view  -->
    <div v-if="Store.selectedConfig !== null">
      <h3> {{ Store.selectedConfig.name }}:</h3>
      <DataTable class="p-datatable-sm" :value="Store.selectedConfig.config.explain.relevance" dataKey="node_name"
                 :rowClass="isTherapyRow">
        <ColumnGroup type="header">
          <Row>
            <Column header="" field="node_name" :rowspan="2"/>
            <Column :header="$t('Relevance')" field="overall_relevance" :rowspan="2"/>
            <Column header="Influence on outcome" :colspan="getGoalKeyNum()"></Column>
          </Row>
          <Row>
            <Column v-for="goal in compareGoalnames" :field="goal" :header="goal" :key="goal"/>
          </Row>
        </ColumnGroup>
        <Column :header="$t('Node')" field="node_name">
          <template #body="slotProps">
            {{ Store.labels[slotProps.data.node_name] }}: {{ getCompareState(slotProps.data.node_name) }}
          </template>
        </Column>
        <Column :header="$t('Relevance')" field="overall_relevance">
          <template #body="slotProps">
            <bar :value="slotProps.data.overall_relevance" color="#004d80" width="200"
                 v-tooltip="slotProps.data.overall_relevance.toFixed(2)*100 + '%'"></bar>
          </template>
        </Column>
        <Column v-for="goal in compareGoalnames" :field="goal" :header="goal" :key="goal">
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
          goalnames.push(this.Store.labels[goal.name] + ": " + goal.selected.name)
        })
      }
      return goalnames
    },
    //does the same as goalnames, but updates when selectedConfig is loaded
    compareGoalnames: function () {
      let goalnames = []
      if (this.Store.selectedConfig != null) {
        if (this.Store.patient.goals != null && this.Store.selectedConfig.config.explain.relevance != null) {
        this.Store.patient.goals.forEach(goal => {
          goalnames.push(this.Store.labels[goal.name] + ": " + goal.selected.name)
        })
      }
      }
      return goalnames
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
      this.Store.selectedConfig.config.explain.states.forEach(node => {
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