<template>
  <DataTable :value="table" class="p-datatable-sm p-2" :autoLayout="true" :rowClass="rowClass"
             selectionMode="single" v-model:selection="selectedOption"
             rowGroupMode="subheader" groupRowsBy="config_name" responsive-layout="scroll"
             @rowSelect="update" @rowUnselect="update">

    <template #groupheader="slotProps">
      <br>
      <b v-if="Store.compareConfig">{{ $t(slotProps.data.config_name) }}:</b>
    </template>

    <Column>
      <template #body="slotProps">
        <div v-if="slotProps.data.config_name === 'current' && slotProps.index > minIndex">
          {{ slotProps.index - minIndex }}.
        </div>
      </template>
    </Column>

    <Column field="option">
      <template #body="slotProps">
        <div v-if="Object.keys(slotProps.data.option).length === 0"><b>{{$t("noInterventions")}}</b></div>
        <div v-else v-for="o in Object.keys(slotProps.data.option)" :key="o">
          {{ Store.labels.nodes[o] }}: {{ Store.labels.states[o][slotProps.data.option[o]] }}
        </div>

      </template>
    </Column>

    <Column>
      <template #body="slotProps">
        <i v-if="slotProps.index === minIndex+1 && slotProps.data.config_name === 'current'"
           class="pi pi-thumbs-up" v-tooltip="$t('BestOption')"/>
      </template>
    </Column>

    <Column v-for="goal in getGoalKeys()" :field="goal.name" :header="getGoalLabel(goal)" :key="goal.name">
      <template #body="slotProps">
        <div class="flex flex-column">
          <bar :value="slotProps.data.goalValues[String(goal.name)]" color="teal" :width="getBarWidth(getGoalKeys().length)"
               v-if="!isNaN(slotProps.data.goalValues[String(goal.name)])" class="flex"
               v-tooltip="(slotProps.data.goalValues[String(goal.name)]*100).toFixed(0) + '%'"></bar>

          <!-- show percentages of selected configs -->
          <div v-if="isCurrentOption(slotProps.data, goal)"
               style="fontSize: 1.5rem" class="flex">
            {{ (slotProps.data.goalValues[String(goal.name)] * 100).toFixed(0) }} %
          </div>

          <!-- recommendation -->
          <div v-if="isCurrentOption(slotProps.data, goal) && Store.currentPhase !== null" style="color:#3f3f46">
              {{ recommendText(goal.name, goal.selected.name, slotProps.data.goalValues[String(goal.name)])}}
          </div>

        </div>
      </template>
    </Column>

    <Column>
      <template #body="slotProps">
        <Button v-if="slotProps.data === Store.predictions.selectedOption"
                class="p-button-secondary p-button-text p-button-rounded"
                icon="pi pi-times" @click="deselect"/>
      </template>
    </Column>

  </DataTable>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import bar from "../visualisations/bar-vis.vue";
import {useStore} from '../../store.ts';
import {NGoal} from "../../types/node_types.ts";
import {Prediction_option} from "../../types/prediction_types.ts";
import {PhaseGoal} from "../../types/phase_types.ts";

export default defineComponent({
  name: "predictions-table",
  components: {
    bar
  },
  setup() {
    const Store = useStore()
    return {Store}
  },
  computed: {
    /**
     * returns data of table by combining current and (optional) compare configuration
     *
     * @returns {any}
     */
    table: function () : Prediction_option[] {
      let table = JSON.parse(JSON.stringify(this.Store.predictions.options))
      if (table !== null) {
        table.forEach((n: Prediction_option) => n.config_name = "current")
        if (this.Store.compareConfig) {
          let compare = this.Store.compareConfig.predictions.selectedOption
          if (compare) {
            compare.config_name = "compare"
            table.push(compare)
          }
        }
      }
      this.updateSelected(table)
      return table
    },
    /**
     * returns minimal index of an option of the table
     *
     * @returns {number}
     */
    minIndex: function () {
      return 0;
    }
  },
  data() {
    return {
      selectedOption: null as Prediction_option | null
    }
  },
  methods: {
    /**
     * returns goals for the columns
     *
     * @returns {[]}
     */
    getGoalKeys() : NGoal[] {
      if (this.Store.patient.goals.length > 0) {
        return this.Store.patient.goals
      }
      return []
    },
    /**
     * returns string of the target combination of an option, or null if it's the basic option
     *
     * @param option
     * @returns {string|null}
     */
    getOptionLabel(option: any) {
      if (option == null) return null
      let label = ""
      Object.keys(option).forEach(d => {
        label = label + d + ": " + option[d] + "; "
      })
      return label
    },

      /**
       * true if row is currently selected
        * @param data
       * @param goal
       * @returns {boolean}
       */
    isCurrentOption(data: Prediction_option, goal: NGoal) {
        let selected = this.Store.predictions.selectedOption
        if (selected === null) return false
        return data.config_name === 'current' &&
              JSON.stringify(data.option) === JSON.stringify(selected.option)
              || data.config_name !== 'current' &&
                 !isNaN(data.goalValues[String(goal.name)])
    },

    /**
     * updates table if an option is selected/ deselected
     *
     * @param event
     */
    update(event: any = null) {
      if (this.table !== null && this.table !== undefined) {

        //in case someone selects an option of compare view
        if (event !== null && event.index < this.minIndex) {
          this.selectedOption = this.table[this.minIndex]
        }

        if (this.selectedOption === null) {
          this.selectedOption = this.table[this.minIndex]
        }
        else {
          let selected = this.selectedOption
          let newOption = this.Store.predictions.options.find(n =>
              selected.config_name === "current" &&
              JSON.stringify(n.option) === JSON.stringify(selected.option)) as Prediction_option
          if (newOption !== this.Store.predictions.selectedOption) {
            this.Store.predictions.selectedOption = newOption
            this.Store.calculateExplanations(this.Store.patient, this.Store.predictions, this.Store.explain)
          }
        }
      }
    },
    /**
     * updates currently selected option when table is recomputed
     *
     * @param table
     */
    updateSelected(table: Prediction_option[]) {
      if (table !== null && table !== undefined) {
        if (this.selectedOption) {
          let selected = this.selectedOption
          let newOption = table.find(n =>
              n.config_name === "current" &&
              JSON.stringify(n.option) === JSON.stringify(selected.option))
          if (newOption) {
            this.selectedOption = newOption
          } else {
            this.selectedOption = table[this.Store.compareConfig ? 1 : 0]
          }
        } else {
          this.selectedOption = table[this.Store.compareConfig ? 1 : 0]
        }
      }
    },
    /**
     * returns column name of a goal column
     *
     * @param goal
     * @returns {string}
     */
    getGoalLabel(goal: NGoal) {
      return this.Store.labels.nodes[goal.name] + ": " + this.Store.labels.states[goal.name][goal.selected.name]
    },
    /**
     * called when an option is deselected. Resets selection to standard.
     */
    deselect() {
      if (this.Store.predictions.likelyResult) {
        this.Store.predictions.selectedOption = this.Store.predictions.likelyResult[0]
      } else {
        this.Store.predictions.selectedOption = this.Store.predictions.options[0]
      }
      this.update()
    },
    /**
     * sets "overall" class to "overall" options
     *
     * @param data
     * @returns {string|null}
     */
    rowClass(data: Prediction_option): string | null {
      return Object.keys(data.option).length === 0 && data.config_name === "current" ? 'overall' : null;
    },
    /**
     * returns dynamically adjusted bar width given the number of rows
     *
     * @param num - number of rows
     * @returns {number}
     */
    getBarWidth(num: number): number {
      return 100 / num + 100
    },

    /**
     * returns text based on phase recommendation
     */
    recommendText(name: string, option: string, value: number) {
        let text = ""
        if (this.Store.currentPhase === null) return text

        this.Store.currentPhase.sets.goal.forEach((goal: PhaseGoal) => {
            if (goal.name === name && goal.option === option && goal.boundary) {
                if (value < goal.boundary && goal.TextBelow) {
                    text = goal.TextBelow
                } else if (value >= goal.boundary && goal.TextAbove) {
                    text = goal.TextAbove
                }
            }
        })
        return text
    }
  }
})
</script>

<style lang="scss" scoped>
::v-deep(.p-highlight) {
  background-color: rgba(55, 55, 55, 0.15) !important;
  border: 2px solid black
}

::v-deep(.overall) {
  border-bottom: 5px solid #607D8B; //I have no idea why this is currently not displayed
}

.p-card {
  box-shadow: none;
}

</style>