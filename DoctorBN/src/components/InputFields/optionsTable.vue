<template>
 <DataTable :value="results" :scrollable="true" scrollHeight="400px"
                 :dataKey="getOptionLabel(option)" selectionMode="single" v-model:selection="selected"
                 @rowSelect="update" @rowUnselect="update">
        <Column header="decision" field="option">
          <template #body="slotProps">
            <div>
            <div v-for="o in Object.keys(slotProps.data.option)" :key="o">
               {{o}}: {{slotProps.data.option[o]}}
            </div>
              </div>
          </template>
        </Column>
        <Column header="joined probability" field="value">
          <template #body="slotProps">
            <bar :value=slotProps.data.value color="RebeccaPurple"
                 v-tooltip="slotProps.data.value.toFixed(2)*100 + '%'"></bar>
          </template>
        </Column>
        <Column v-for="goal in getGoalKeys()" :field="goal" :header="goal" :key="goal">
          <template #body="slotProps">
            <bar :value="slotProps.data.goalValues[String(goal)]" color="RebeccaPurple"
            v-tooltip="slotProps.data.goalValues[String(goal)].toFixed(2)*100 + '%'"></bar>
          </template>
        </Column>
      </DataTable>
</template>

<script>
import bar from "@/components/visualisations/bar";

export default {
  name: "optionsTable",
  components: {
    bar
  },
  data() {
    return {
      "selected": null
    }
  },
  props: [
    "results",
      "goals",
      "selectedOption"
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