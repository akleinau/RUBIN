<template style="position:relative">
  <Card>
    <template #title>
      Available options
    </template>
    <template #content>
    <h3 class="p-text-left">Interventions:</h3>
  <TherapyInput :nodes="nodes" :selection="targets"
     @addNodes="$emit('addNodes',$event)" @deleteNode="$emit('deleteNode',$event)" />
  <div>
    <h3 class="p-text-left">Decision Ratings:</h3>
    <ProgressBar v-if="loading" mode="indeterminate" style="height: .5em" />
  </div>
      <optionsTable :results="results" :goals="goals"
                @update="update($event)" :selectedOption="selectedOption"></optionsTable>
      <div v-if="compareConfig">
        <h3> {{compareConfig.name}}:</h3>
        <optionsTable :results="compareConfig.config.options.options"
                :goals="compareConfig.config.newGoals" @update="update($event)" :selectedOption="selectedOption" />
      </div>

      </template>
    </Card>
</template>

<script>
import TherapyInput from "@/components/InputFields/TherapyInput";
import optionsTable from "@/components/InputFields/optionsTable"

export default {
  name: "TherapyOptions",
  components: {
    TherapyInput,
    optionsTable
  },
  props: [
    "results",
    "goals",
      "nodes",
      "targets",
      "selectedOption",
      "loading",
      "compareConfig"
  ],
  methods: {
    update(name) {
      this.$emit("update", name);
    },
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