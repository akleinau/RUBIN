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

  </TabView>
</template>

<script>
import optionsVis from "@/components/visualisations/optionsVis";
import bar from "@/components/visualisations/bar";

export default {
  name: "TherapyOptions",
  components: {
    optionsVis,
    bar
  },
  props: [
    "results",
    "goals"
  ],
  data() {
    return {
      columns: []
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