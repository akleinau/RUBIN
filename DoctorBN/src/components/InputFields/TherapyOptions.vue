<template>

  <Card style="height:100%">

    <template #title>
      Available options
    </template>
    <template #content >
      <ScrollPanel style="height:100%">
      <div>
        <h3 class="p-text-left">Interventions:</h3>
        <TherapyInput :nodes="nodes" :selection="targets"
                      @addNodes="$emit('addNodes',$event)" @deleteNode="$emit('deleteNode',$event)"/>
        <div>
          <h3 class="p-text-left">Decision Ratings:</h3>
          <ProgressBar v-if="loading" mode="indeterminate" style="height: .5em"/>
        </div>
        <optionsTable :results="results" :goals="goals"
                      @update="update($event)" :selectedOption="selectedOption"></optionsTable>
        <div v-if="compareConfig">
          <h3> {{ compareConfig.name }}:</h3>
          <optionsTable :results="compareConfig.config.options.options"
                        :goals="compareConfig.config.newGoals" @update="update($event)"
                        :selectedOption="selectedOption"/>
        </div>
      </div>
        </ScrollPanel>
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

</style>