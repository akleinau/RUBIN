<template>
 <DataTable :value="results" class="p-datatable-sm" :autoLayout="true"
                 :dataKey="getOptionLabel(option)" selectionMode="single" v-model:selection="selected"
                 @rowSelect="update" @rowUnselect="update" >
        <Column>
          <template #body="slotProps">
              {{slotProps.index +1}}.
          </template>
        </Column>
        <Column :header="$t('Decision')" field="option">
          <template #body="slotProps">
            <div v-for="o in Object.keys(slotProps.data.option)" :key="o">
              {{labels[o]}}: {{slotProps.data.option[o]}}
            </div>
          </template>
        </Column>
        <Column >
          <template #body="slotProps">
            <i v-if="slotProps.index === 0" class="pi pi-thumbs-up" name="star" v-tooltip="$t('BestOption')"/>
          </template>
        </Column>
        <Column v-for="goal in getGoalKeys()" :field="goal" :header="goal" :key="goal">
          <template #body="slotProps">
            <bar :value="slotProps.data.goalValues[String(goal)]" color="teal" width="200"
            v-tooltip="(slotProps.data.goalValues[String(goal)]*100).toFixed(0) + '%'"></bar>
          </template>
        </Column>
      </DataTable>
</template>

<script>
import bar from "@/components/visualisations/bar";


export default {
  name: "optionsTable",
  emits: ["update"],
  components: {
    bar
  },
  data() {
    return {
      selected: null,
      optionCount: 0
    }
  },
  props: [
    "results",
      "goals",
      "selectedOption",
      "labels"
  ],
    watch: {
    selectedOption: function () {
      this.selected = this.selectedOption
    }
  },
  methods: {
    getGoalKeys() {
      if (this.goals != null) {
        return Object.keys(this.goals)
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
      this.$emit("update", this.selected);
    },
  }
}
</script>

<style scoped>

</style>