<template>
  <DataTable :value="Store.options.options" class="p-datatable-sm" :autoLayout="true" :rowClass="rowClass"
             :dataKey="getOptionLabel(option)" selectionMode="single" v-model:selection="Store.options.selectedOption"
             @rowSelect="update" @rowUnselect="update">

    <Column>
      <template #body="slotProps">
        <div v-if="slotProps.index > 0">
          {{ slotProps.index }}.
        </div>
      </template>
    </Column>

    <Column field="option">
      <template #body="slotProps">
        <div v-for="o in Object.keys(slotProps.data.option)" :key="o">
          {{ Store.labels[o] }}: {{ slotProps.data.option[o] }}
        </div>
        <div v-if="slotProps.index===0"><b>overall</b></div>
      </template>
    </Column>

    <Column>
      <template #body="slotProps">
        <i v-if="slotProps.index === 1" class="pi pi-thumbs-up" name="star" v-tooltip="$t('BestOption')"/>
      </template>
    </Column>

    <Column v-for="goal in getGoalKeys()" :field="goal.name" :header="getGoalLabel(goal)" :key="goal.name">
      <template #body="slotProps">
        <bar :value="slotProps.data.goalValues[String(goal.name)]" color="teal" width="200"
             v-tooltip="(slotProps.data.goalValues[String(goal.name)]*100).toFixed(0) + '%'"></bar>
        <div v-if="slotProps.data === Store.options.selectedOption" style="fontSize: 1.5rem">
          {{ (slotProps.data.goalValues[String(goal.name)] * 100).toFixed(0) }} %
        </div>
      </template>
    </Column>

    <Column>
      <template #body="slotProps">
        <Button v-if="slotProps.data === Store.options.selectedOption"
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
    update() {
      if (this.Store.options.selectedOption === []) this.Store.explain.relevance = null
      else {
        this.Store.calculateExplanations(this.Store.patient, this.Store.options, this.Store.explain)
      }
    },
    getGoalLabel(goal) {
      return this.Store.labels[goal.name] + ": " + goal.selected.name
    },
    deselect() {
      this.Store.options.selectedOption = this.Store.options.likelyResult[0]
      this.update()
    },
    rowClass(data) {
      return Object.keys(data.option).length === 0 ? 'overall' : null;
    },
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

</style>