<template>
  <DataTable :value="table" class="p-datatable-sm p-2" :autoLayout="true" :rowClass="rowClass"
             :dataKey="getOptionLabel(option)" selectionMode="single" v-model:selection="selectedOption"
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
          {{ Store.labels[o] }}: {{ Store.option_labels[o][slotProps.data.option[o]] }}
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
  name: "options-table",
  components: {
    bar
  },
  setup() {
    const Store = useStore()
    return {Store}
  },
  computed: {
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
    getGoalKeys() {
      if (this.Store.patient.goals != null) {
        return this.Store.patient.goals
      }
    },
    getOptionLabel(option) {
      if (option == null) return null
      let label = ""
      Object.keys(option).forEach(d => {
        label = label + d + ": " + option[d] + "; "
      })
      return label
    },
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
    getGoalLabel(goal) {
      return this.Store.labels[goal.name] + ": " + this.Store.option_labels[goal.name][goal.selected.name]
    },
    deselect() {
      this.Store.predictions.selectedOption = this.Store.predictions.likelyResult[0]
      this.update()
    },
    rowClass(data) {
      return Object.keys(data.option).length === 0 && data.config_name === "current" ? 'overall' : null;
    },
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
  //background-color: lightblue !important;
  border-bottom: 5px solid #607D8B;
}

.p-card {
  box-shadow: none;
}

</style>