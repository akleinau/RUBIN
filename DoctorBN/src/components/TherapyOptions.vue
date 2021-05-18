<template>
  <TabView header="Options">
    <TabPanel header="table">
      <DataTable :value="results" :scrollable="true" scrollHeight="300px"
                 dataKey="id">
        <Column header="option" field="option"/>
        <Column header="value" field="value">
          <template #body="slotProps">
            <bar :value=slotProps.data.value></bar>
          </template>
        </Column>
        <Column v-for="goal in getGoalKeys()" :field="goal" :header="goal" :key="goal">
          <template #body="slotProps">
            <bar :value="slotProps.data.goalValues[String(goal)]"></bar>
          </template>
        </Column>
      </DataTable>
    </TabPanel>
    <TabPanel header="image">
      <img src="../assets/options.png">
    </TabPanel>
    <TabPanel header="vis">
      <options-vis :results="results"/>
    </TabPanel>
    <TabPanel header="compare">
            <DataTable :value="results" :scrollable="true" scrollHeight="300px"
                 dataKey="id">
        <Column header="option" field="option"/>
        <Column header="value" field="value">
          <template #body="slotProps">
            <twoSidedBar :value="slotProps.data.value - goalResults.value"></twoSidedBar>
          </template>
        </Column>
        <Column v-for="goal in getGoalKeys()" :field="goal" :header="goal" :key="goal">
          <template #body="slotProps">
            <twoSidedBar :value="slotProps.data.goalValues[String(goal)] - goalResults.goalValues[String(goal)]"></twoSidedBar>
          </template>
        </Column>
      </DataTable>
    </TabPanel>

  </TabView>
</template>

<script>
import optionsVis from "@/components/visualisations/optionsVis";
import bar from "@/components/visualisations/bar";
import twoSidedBar from "@/components/visualisations/twoSidedBar";

export default {
  name: "TherapyOptions",
  components: {
    optionsVis,
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
      normal: 0.9
    }
  },
  methods: {
    getGoalKeys() {
        if (this.goals != null) {
          return Object.keys(this.goals)
        }

    }
  }
}
</script>

<style scoped>

</style>