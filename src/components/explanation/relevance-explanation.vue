<template>
    <ScrollPanel style="width: 100%; height: 100%">
    <DataTable class="w-full p-datatable-sm" :value="displayed_table"
               rowGroupMode="subheader" groupRowsBy="config_name"

               :rowClass="isTherapyRow"  id="relevanceExplanation">

      <template #groupheader="slotProps">
        <br>
        <b v-if="Store.compareConfig">{{ $t(slotProps.data.config_name) }}:</b>
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
          <bar :value="slotProps.data.overall_relevance" color="#004d80" width="150"
               v-tooltip="(slotProps.data.overall_relevance*100).toFixed(0) + '%'"></bar>
        </template>
      </Column>
      <Column v-for="goal in goalnames" :key="goal">
        <template #body="slotProps">
          <twoSidedBar :value="slotProps.data.relevancies[goal.name]" :direction="goal.direction" :width="150"
                       v-tooltip.left="{value: getDirectionTooltip(slotProps.data.relevancies[goal.name],
                       goal.label), fitContent: true}"
          />
        </template>
      </Column>

    </DataTable>
    <ToggleButton v-if="Store.compareConfig && (curr_table.length > 3 || compare_table.length > 3)"
                  v-model="showDetails" onIcon="pi pi-chevron-up" offIcon="pi pi-chevron-down"
                  :onLabel="$t('hideDetails')" :offLabel="$t('showDetails')" style="border: 2px solid #4338CA" />
    </ScrollPanel>

</template>

<script lang="ts">
import { defineComponent } from 'vue';
import bar from "../visualisations/bar-vis.vue";
import twoSidedBar from "../visualisations/two-sided-bar-vis.vue";
import {useStore} from '../../store.ts';
import {usePatientStore} from "../../stores/patient_store.ts";
import {RelevanceNode, RelevancePrediction} from "../../types/explanation_types";

export default defineComponent({
  name: "relevance-explanation",
  components: {
    bar,
    twoSidedBar
  },
  setup() {
    const Store = useStore()
    const PatientStore = usePatientStore()
    return {Store, PatientStore}
  },
  data() {
    return {
      showLocal: false as boolean,
      showDetails: false as boolean,
      sliceNr: 3 as number,
      show_table: true as boolean,
      displayed_table: [] as any[],
    }
  },
  mounted() {
      this.displayed_table = this.table
  },

    computed: {
      /**
       * computes the column names of the individual goal's columns
       *
       * @returns {Object[]}
       */
    goalnames: function () {
      let goalnames: any[] = []
      if (this.PatientStore.goals != null && this.Store.explain.relevance != null) {
        this.PatientStore.goals.forEach((goal: any) => {
          goalnames.push({
            "name": goal.name + ": " + goal.selected.name,
            "label": this.Store.labels.nodes[goal.name] + ": " + this.Store.labels.states[goal.name][goal.selected.name],
            "direction": goal.direction
          })
        })
      }
      return goalnames
    },

      /**
       * returns data for the relevance table
       *
       * @returns {*[]}
       */
    curr_table: function () {
      if (this.Store.explain.relevance) {
        let table : RelevanceNode[] = []
        this.Store.explain.relevance.forEach((n: RelevancePrediction) => {
          table.push({
            config_name: "current",
            label: this.Store.labels.nodes[n.node_name],
            node_name: n.node_name,
            state: this.getState(n.node_name),
            overall_relevance: n.overall_relevance,
            relevancies: n.relevancies
          })
        })

        table.sort((a, b) => b.overall_relevance - a.overall_relevance)

        return table
      } else return []
    },

    compare_table: function () {
        //compare
        if (this.Store.compareConfig != null) {
          let tableCompare : RelevanceNode[] = []
          this.Store.compareConfig.explain.relevance.forEach((n: any) => {
            tableCompare.push({
              config_name: "compare",
              label: this.Store.labels.nodes[n.node_name],
              node_name: n.node_name,
              state: this.getCompareState(n.node_name),
              overall_relevance: n.overall_relevance,
              relevancies: n.relevancies
            })
          })

          tableCompare.sort((a, b) => b.overall_relevance - a.overall_relevance)

          return tableCompare

        }
        else return []
    },

    table: function () {
        if (this.Store.compareConfig != null) {
            if(!this.showDetails) {
                let table1 = JSON.parse(JSON.stringify(this.curr_table.slice(0, this.sliceNr)))
                let table2 = JSON.parse(JSON.stringify(this.compare_table.slice(0, this.sliceNr)))
                return table1.concat(table2)
              //return JSON.parse(JSON.stringify(this.curr_table.slice(0, this.sliceNr).concat(this.compare_table.slice(0, this.sliceNr))))
            }
            return JSON.parse(JSON.stringify(this.curr_table.concat(this.compare_table)))
        }
        else return this.curr_table
    }

  },
  watch: {
    table: function() {
        this.set_new_display_table()
    },
  },

  methods: {
      async set_new_display_table() {
          this.displayed_table = []
          await this.$nextTick()
          this.displayed_table = this.table
      },
      /**
       * returns number of goals
       *
       * @returns {number}
       */
    getGoalKeyNum() {
      if (this.PatientStore.goals != null) {
        return this.PatientStore.goals.length
      } else {
        return 0
      }
    },
      /**
       * returns tooltips for the two-sided bars showing influence on outcomes.
       *
       * @param number - the numerical influence score
       * @param label - name of the goal
       * @returns {*|string}
       */
    getDirectionTooltip(number: number, label: String) {
        if (number > 0.001) return this.$t("increasesProbability") + " " + label
        else if (number < -0.001) return this.$t("decreasesProbability") + " " + label

      return this.$t("noInfluence")
    },
      /**
       * returns state of a node
       *
       * @param name - node name
       * @returns {string}
       */
    getState(name: string) {
      let state : string = "unknown"
      this.Store.explain.states.forEach((node: any) => {
        if (node.name === name) {
          state = this.Store.labels.states[name][node.state]
        }
      })
      return state
    },
      /**
       * returns compare config state of a node
       *
       * @param name - node name
       * @returns {string}
       */
    getCompareState(name: string) {
      let state = "unknown"
      if (this.Store.compareConfig === null) return state

      this.Store.compareConfig.explain.states.forEach((node: any) => {
        if (node.name === name) {
          state = this.Store.labels.states[name][node.state]
        }
      })
      return state
    },
      /**
       * returns if a row contains a target node
       *
       * @param row
       * @returns {null}
       */
    isTherapyRow(row: RelevanceNode) {
      let rowClass = null
      this.PatientStore.targets.forEach((target: any) => {
        if (target.name === row.node_name) rowClass = "therapy"
      })
      return rowClass
    },
      /**
       * returns true if a node is part of the current or compare configuration, but not the other
       *
       * @param row
       * @returns {boolean}
       */
    isDifferentName(row: RelevanceNode) {
      if (row.config_name === "compare") {
        return !this.Store.explain.relevance.find((a: any) => a.node_name === row.node_name);
      }
      if (this.Store.compareConfig !== null) {
        return !this.Store.compareConfig.explain.relevance.find((a: any) => a.node_name === row.node_name)
      }
      return false
    },
      /**
       * returns true if the node state of the current and compare configuration are different
       *
       * @param row
       * @returns {boolean}
       */
    isDifferentState(row: RelevanceNode) {
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
})
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