<template>
  <TabView header="Options">
    <TabPanel header="table">
      <DataTable :value="results" :scrollable="true" scrollHeight="300px"
                 :dataKey="getOptionLabel(option)" selectionMode="single" v-model:selection="selectedOption"
                 @rowSelect="onRowSelect" @rowUnselect="onRowUnselect">
        <Column header="option" field="option">
          <template #body="slotProps">
            <div>
            <div v-for="o in Object.keys(slotProps.data.option)" :key="o">
               {{o}}: {{slotProps.data.option[o]}}
            </div>
              </div>
          </template>
        </Column>
        <Column header="value" field="value">
          <template #body="slotProps">
            <bar :value=slotProps.data.value color="RebeccaPurple"></bar>
          </template>
        </Column>
        <Column v-for="goal in getGoalKeys()" :field="goal" :header="goal" :key="goal">
          <template #body="slotProps">
            <bar :value="slotProps.data.goalValues[String(goal)]" color="RebeccaPurple"></bar>
          </template>
        </Column>
      </DataTable>
    </TabPanel>
    <TabPanel header="compare">
      <DataTable :value="results" :scrollable="true" scrollHeight="300px"
                 :dataKey="getOptionLabel(option)" selectionMode="single" v-model:selection="selectedOption"
                 @rowSelect="onRowSelect" @rowUnselect="onRowUnselect">
        <Column header="option" field="option">
                    <template #body="slotProps">
            <div>
            <div v-for="o in Object.keys(slotProps.data.option)" :key="o">
               {{o}}: {{slotProps.data.option[o]}}
            </div>
              </div>
          </template>
        </Column>
        <Column header="value" field="value">
          <template #body="slotProps">
            <twoSidedBar :value="slotProps.data.value - goalResults.value"></twoSidedBar>
          </template>
        </Column>
        <Column v-for="goal in getGoalKeys()" :field="goal" :header="goal" :key="goal">
          <template #body="slotProps">
            <twoSidedBar
                :value="slotProps.data.goalValues[String(goal)] - goalResults.goalValues[String(goal)]"></twoSidedBar>
          </template>
        </Column>
      </DataTable>
    </TabPanel>

  </TabView>
</template>

<script>
import bar from "@/components/visualisations/bar";
import twoSidedBar from "@/components/visualisations/twoSidedBar";

export default {
  name: "TherapyOptions",
  components: {
    bar,
    twoSidedBar
  },
  props: [
    "results",
    "goals",
    "goalResults"
  ],
  data() {
    return {
      columns: [],
      normal: 0.9,
      selectedOption: null
    }
  },
  methods: {
    getOptionLabel(option) {
      if (option == null) return null
      let label = ""
      Object.keys(option).forEach(d => {
        label = label + d + ": " + option[d] + "; "
      })
      return label
    },
    getGoalKeys() {
      if (this.goals != null) {
        return Object.keys(this.goals)
      }

    },
    onRowSelect() {
      this.$emit("update", this.selectedOption);
    },
    onRowUnselect() {
      this.$emit("update", this.selectedOption);
    }
  }
}
</script>

<style scoped>

</style>