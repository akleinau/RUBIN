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
          <div v-if="slotProps.data.config_name === 'current' &&
              JSON.stringify(slotProps.data.option) === JSON.stringify(this.selectedOption.option)
              || slotProps.data.config_name !== 'current' &&
                 !isNaN(slotProps.data.goalValues[String(goal.name)])"
               style="fontSize: 1.5rem" class="flex">
            {{ (slotProps.data.goalValues[String(goal.name)] * 100).toFixed(0) }} %
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

<script>
import bar from "@/components/visualisations/bar-vis";
import {useStore} from '@/store'

export default {
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
    table: function () {
      let table = JSON.parse(JSON.stringify(this.Store.predictions.options))
      if (table !== null) {
        table.forEach(n => n.config_name = "current")
        if (this.Store.compareConfig) {
          let compare = this.Store.compareConfig.predictions.selectedOption
          compare.config_name = "compare"
          table.push(compare)
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
      selectedOption: []
    }
  },
  methods: {
    /**
     * returns goals for the columns
     *
     * @returns {[]}
     */
    getGoalKeys() {
      if (this.Store.patient.goals != null) {
        return this.Store.patient.goals
      }
    },
    /**
     * returns string of the target combination of an option, or null if it's the basic option
     *
     * @param option
     * @returns {string|null}
     */
    getOptionLabel(option) {
      if (option == null) return null
      let label = ""
      Object.keys(option).forEach(d => {
        label = label + d + ": " + option[d] + "; "
      })
      return label
    },

    /**
     * updates table if an option is selected/ deselected
     *
     * @param event
     */
    update(event) {
      if (this.table !== null && this.table !== undefined) {

        //in case someone selects an option of compare view
        if (event.index < this.minIndex) {
          this.selectedOption = this.table[this.minIndex]
        }

        if (this.selectedOption.length === 0) {
          this.selectedOption = this.table[this.minIndex]
        }

        let newOption = this.Store.predictions.options.find(n =>
            this.selectedOption.config_name === "current" &&
            JSON.stringify(n.option) === JSON.stringify(this.selectedOption.option))
        if (newOption !== this.Store.predictions.selectedOption) {
          this.Store.predictions.selectedOption = newOption
          this.Store.calculateExplanations(this.Store.patient, this.Store.predictions, this.Store.explain)
        }
      }
    },
    /**
     * updates currently selected option when table is recomputed
     *
     * @param table
     */
    updateSelected(table) {
      if (table !== null && table !== undefined) {
        if (this.selectedOption) {
          let newOption = table.find(n =>
              n.config_name === "current" &&
              JSON.stringify(n.option) === JSON.stringify(this.selectedOption.option))
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
    getGoalLabel(goal) {
      return this.Store.labels.nodes[goal.name] + ": " + this.Store.labels.states[goal.name][goal.selected.name]
    },
    /**
     * called when an option is deselected. Resets selection to standard.
     */
    deselect() {
      this.Store.predictions.selectedOption = this.Store.predictions.likelyResult[0]
      this.update()
    },
    /**
     * sets "overall" class to "overall" options
     *
     * @param data
     * @returns {string|null}
     */
    rowClass(data) {
      return Object.keys(data.option).length === 0 && data.config_name === "current" ? 'overall' : null;
    },
    /**
     * returns dynamically adjusted bar width given the number of rows
     *
     * @param num - number of rows
     * @returns {number}
     */
    getBarWidth(num) {
      return 100 / num + 100
    }
  }
}
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