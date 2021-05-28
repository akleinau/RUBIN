<template>
  <div class="p-d-flex p-dir-col" v-if="onlyGlobal===true">
    <DataTable class="p-col" :value="relevance" :scrollable="true" scrollHeight="500px">
        <Column header="option" field="node_name"/>
        <Column header="overall relevance" field="overall_relevance">
          <template #body="slotProps">
            <bar :value="slotProps.data.overall_relevance" color="midnightblue"></bar>
          </template>
        </Column>
      </DataTable>
    <dif class="p-col">
      <i class="pi pi-chevron-down" style="fontSize: 5rem"></i>
    </dif>
    <dif class="p-col">
      <div v-for="goal in getGoalForSummary()" :key="goal" style="fontSize: 2rem">{{goal}}</div>
    </dif>
</div>

<DataTable :value="relevance" :scrollable="true" scrollHeight="500px" v-if="onlyGlobal===false">
        <Column header="option" field="node_name"/>
        <Column header="overall relevance" field="overall_relevance">
          <template #body="slotProps">
            <bar :value="slotProps.data.overall_relevance" color="midnightblue"></bar>
          </template>
        </Column>
        <Column v-for="goal in getGoalKeys()" :field="goal" :header="goal" :key="goal" >
          <template #body="slotProps">
            <twoSidedBar :value="slotProps.data.relevancies[goal]"></twoSidedBar>
          </template>
        </Column>
</DataTable>
  <Button label="show more" @click="onlyGlobal = false" v-if="onlyGlobal===true"></Button>
  <Button label="show less" @click="onlyGlobal = true" v-if="onlyGlobal===false"></Button>

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
      "goals",
      "nodes"
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
    },
        getGoalForSummary() {
      if (this.goals != null && this.nodes != null) {
        let goalnames = []
        Object.keys(this.goals).forEach(goal => {
          goalnames.push(goal + " - " + this.goals[goal] + ": " +
              (this.nodes.find(d => d.name === goal)).probability.toFixed(2)*100 + "%")
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