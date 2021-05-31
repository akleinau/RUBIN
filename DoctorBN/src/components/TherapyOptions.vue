<template style="position:relative">
  <Card>
    <template #title>
      Available options
    </template>
    <template #content>
    <h3 class="p-text-left">Interventions:</h3>
  <Therapy :nodes="nodes" :selection="targets"
     @addNodes="$emit('addNodes',$event)" @deleteNode="$emit('deleteNode',$event)" />
  <div>
    <h3 class="p-text-left">Results:</h3>
  </div>
  <TabView header="Options">
    <TabPanel header="table">
      <DataTable :value="results" :scrollable="true" scrollHeight="400px"
                 :dataKey="getOptionLabel(option)" selectionMode="single" v-model:selection="selected"
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
    </TabPanel>
    <TabPanel header="compare">
      <DataTable :value="results" :scrollable="true" scrollHeight="300px"
                 :dataKey="getOptionLabel(option)" selectionMode="single" v-model:selection="selected"
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
    </Card>
</template>

<script>
import bar from "@/components/visualisations/bar";
import twoSidedBar from "@/components/visualisations/twoSidedBar";
import Therapy from "@/components/Therapy";

export default {
  name: "TherapyOptions",
  components: {
    bar,
    twoSidedBar,
    Therapy
  },
  props: [
    "results",
    "goals",
    "goalResults",
      "nodes",
      "targets",
      "selectedOption"
  ],
  watch: {
    selectedOption: function () {
      this.selected = this.selectedOption
    }
  },
  data() {
    return {
      columns: [],
      normal: 0.9,
      selected: null
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
      this.$emit("update", this.selected);
    },
    onRowUnselect() {
      this.$emit("update", this.selected);
    }
  }
}
</script>

<style lang="scss" scoped>

.p-card {
  height: 100% !important;

  display: grid;
  grid-template-rows: auto 1fr;
}

::v-deep(.p-panel-content) {
height: 100% !important;
}

</style>