<template>
 <DataTable :value="results" class="p-datatable-sm" :autoLayout="true"
                 :dataKey="getOptionLabel(option)" selectionMode="single" v-model:selection="selected"
                 @rowSelect="update" @rowUnselect="update">
        <Column>
          <template #body="slotProps">
              {{slotProps.index +1}}.
          </template>
        </Column>
        <Column header="decision" field="option">
          <template #body="slotProps">
            <div v-for="o in Object.keys(slotProps.data.option)" :key="o">
              {{o}}: {{slotProps.data.option[o]}}
            </div>
          </template>
        </Column>
        <Column >
          <template #body="slotProps">
            <Icon v-if="slotProps.index === 0" class="pi pi-thumbs-up" name="star" v-tooltip="'best option'"/>
          </template>
        </Column>
        <Column header="certainty of desired outcomes" field="value" style="width:40%">
          <template #body="slotProps">
            <bar :value=slotProps.data.value color="RebeccaPurple"
                 v-tooltip="slotProps.data.value.toFixed(2)*100 + '%'"></bar>
          </template>
        </Column>
        <Column v-for="goal in getGoalKeys()" :field="goal" :header="goal" :key="goal">
          <template #body="slotProps">
            <bar :value="slotProps.data.goalValues[String(goal)]" color="teal"
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
      "selected": null,
      optionCount: 0
    }
  },
  props: [
    "results",
      "goals",
      "selectedOption",
      "showLocal"
  ],
    watch: {
    selectedOption: function () {
      this.selected = this.selectedOption
    }
  },
  methods: {
    getGoalKeys() {
      if (this.goals != null && this.showLocal) {
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