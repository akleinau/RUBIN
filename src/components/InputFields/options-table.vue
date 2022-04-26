<template>
 <DataTable :value="Store.options.options" class="p-datatable-sm" :autoLayout="true"
                 :dataKey="getOptionLabel(option)" selectionMode="single" v-model:selection="Store.options.selectedOption"
                 @rowSelect="update" @rowUnselect="update" >
        <Column>
          <template #body="slotProps">
              {{slotProps.index +1}}.
          </template>
        </Column>
        <Column :header="$t('Decision')" field="option">
          <template #body="slotProps">
            <div v-for="o in Object.keys(slotProps.data.option)" :key="o">
              {{Store.labels[o]}}: {{slotProps.data.option[o]}}
            </div>
          </template>
        </Column>
        <Column >
          <template #body="slotProps">
            <i v-if="slotProps.index === 0" class="pi pi-thumbs-up" name="star" v-tooltip="$t('BestOption')"/>
          </template>
        </Column>
        <Column v-for="goal in getGoalKeys()" :field="goal" :header="getGoalLabel(goal)" :key="goal">
          <template #body="slotProps">
            <bar :value="slotProps.data.goalValues[String(goal)]" color="teal" width="200"
            v-tooltip="(slotProps.data.goalValues[String(goal)]*100).toFixed(0) + '%'"></bar>
          </template>
        </Column>
        <Column>
          <template #body="slotProps">
            <Button v-if="slotProps.data === Store.options.selectedOption" class="p-button-secondary p-button-text p-button-rounded"
                    icon="pi pi-times" @click="deselect" />
          </template>
        </Column>
      </DataTable>
</template>

<script>
import bar from "@/components/visualisations/bar-vis";
import { useStore } from '@/store'

export default {
  name: "options-table",
  components: {
    bar
  },
  setup() {
    const Store = useStore()
    return { Store }
  },
  methods: {
    getGoalKeys() {
      if (this.Store.newGoals != null) {
        return Object.keys(this.Store.newGoals)
      }},
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
        this.Store.calculateOption()
      }
    },
    getGoalLabel(goal) {
      return this.Store.labels[goal] + ": " + this.Store.newGoals[goal]
    },
    deselect() {
      this.Store.options.selectedOption = this.Store.options.likelyResult[0]
      this.update()
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep(.p-highlight) {
  background-color: rgba(55, 55, 55, 0.15) !important;
  border: 2px solid black
}
</style>