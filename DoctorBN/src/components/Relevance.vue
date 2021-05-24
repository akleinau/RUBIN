<template>
<DataTable :value="relevance" :scrollable="true" scrollHeight="500px">
        <Column header="option" field="node_name"/>
        <Column header="global relevance" field="overall_relevance">
          <template #body="slotProps">
            <bar :value="slotProps.data.overall_relevance" color="midnightblue"></bar>
          </template>
        </Column>
        <Column v-for="goal in getGoalKeys()" :field="goal" :header="goal" :key="goal">
          <template #body="slotProps">
            <twoSidedBar :value="slotProps.data.relevancies[goal]"></twoSidedBar>
          </template>
        </Column>
      </DataTable>


</template>

<script>
import bar from "@/components/visualisations/bar";
import twoSidedBar from "@/components/visualisations/twoSidedBar";

export default {
  name: "Relevance",
  components: {
    bar,
    twoSidedBar
  },
  props: [
      "relevance",
      "goals"
  ],
  data() {
    return {
      onlyGlobal: true
    }
  },
  methods:{
    getGoalKeys() {
      if (this.goals != null) {
        let goalnames = []
        Object.keys(this.goals).forEach(goal => {
          goalnames.push(goal + ": " + this.goals[goal])
        })

        return goalnames
      }
    }
  }
}
</script>

<style scoped>
#relevance {
  background-color: white;

}

img {
  width: 100%;
}


</style>