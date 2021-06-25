<template>
  <div class="p-d-flex p-dir-col">
    <DataTable class="p-col p-datatable-sm" :value="relevance">
      <Column :header="$t('Node')" field="node_name"/>
      <Column :header="$t('Relevance')" field="overall_relevance">
        <template #body="slotProps">
          <bar :value="slotProps.data.overall_relevance" color="#004d80"
               v-tooltip="slotProps.data.overall_relevance.toFixed(2)*100 + '%'"></bar>
        </template>
      </Column>
    </DataTable>
    <dif class="p-col" v-if="compareConfig == null">
      <i class="pi pi-chevron-down" style="fontSize: 5rem"></i>
    </dif>
    <dif class="p-col" v-if="compareConfig == null">
      <div v-for="goal in getGoalForSummary()" :key="goal" style="fontSize: 2rem">{{ goal }}</div>
    </dif>
    <dif class="p-col" v-else>
      <h3> {{ compareConfig.name }}:</h3>
      <DataTable class="p-col p-datatable-sm" :value="compareConfig.config.explain.relevance" >
        <Column :header="$t('Node')" field="node_name"/>
        <Column :header="$t('Relevance')" field="overall_relevance">
          <template #body="slotProps">
            <bar :value="slotProps.data.overall_relevance" color="#004d80"
                 v-tooltip="slotProps.data.overall_relevance.toFixed(2)*100 + '%'"></bar>
          </template>
        </Column>
      </DataTable>
    </dif>
  </div>

  <Dialog :header="$t('localRelevance')" v-model:visible="showLocal" style="width:90%; height:90%; background-color:white"
    modal="true">
    <DataTable :value="relevance" class="p-datatable-sm">
      <Column :header="$t('Node')" field="node_name"/>
      <Column :header="$t('Relevance')" field="overall_relevance">
        <template #body="slotProps">
          <bar :value="slotProps.data.overall_relevance" color="#004d80"
               v-tooltip="slotProps.data.overall_relevance.toFixed(2)*100 + '%'"></bar>
        </template>
      </Column>
      <Column v-for="goal in getGoalKeys()" :field="goal" :header="goal" :key="goal">
        <template #body="slotProps">
          <twoSidedBar :value="slotProps.data.relevancies[goal]"
                       v-tooltip="slotProps.data.relevancies[goal].toFixed(2)*100 + '%'"></twoSidedBar>
        </template>
      </Column>
    </DataTable>
    <h3 v-if="compareConfig"> {{ compareConfig.name }}:</h3>
    <DataTable :value="compareConfig.config.explain.relevance"
               v-if="compareConfig" class="p-datatable-sm">
      <Column :header="$t('Node')" field="node_name"/>
      <Column :header="$t('Relevance')" field="overall_relevance">
        <template #body="slotProps">
          <bar :value="slotProps.data.overall_relevance" color="#004d80"
               v-tooltip="slotProps.data.overall_relevance.toFixed(2)*100 + '%'"></bar>
        </template>
      </Column>
      <Column v-for="goal in getGoalKeys()" :field="goal" :header="goal" :key="goal">
        <template #body="slotProps">
          <twoSidedBar :value="slotProps.data.relevancies[goal]"
                       v-tooltip="slotProps.data.relevancies[goal].toFixed(2)*100 + '%'"></twoSidedBar>
        </template>
      </Column>
    </DataTable>
  </Dialog>

  <Button :label="$t('ShowMore')" @click="showLocal = true" ></Button>

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
    "nodes",
    "compareConfig",
    "selectedOption"
  ],
  data() {
    return {
      showLocal: false
    }
  },
  methods: {
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
      if (this.goals != null && this.selectedOption != null) {
        let goalnames = []
        Object.keys(this.goals).forEach(goal => {
          goalnames.push(goal + " - " + this.goals[goal] + ": " +
              this.selectedOption.goalValues[goal].toFixed(2) * 100 + "%")
        })
        console.log(this.selectedOption)
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