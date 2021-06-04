<template>
 <Card>
    <template #title style="height:100%" :class="DesiredOutcomes">
      Desired Outcomes
    </template>
    <template #content style="height:100%">
      <ScrollPanel  style="height:100%">
      <NodeInput    title="Desired Outcomes" :nodes="nodes" :selection="selection" :changeable="true"
                   @addNodes="$emit('addNodes', $event)" @deleteNode="$emit('deleteNode',$event)"/>
      <div v-if="compareConfig">
        <divider />
        <h3> {{compareConfig.name}}:</h3>
        <NodeInput    title="Desired Outcomes" :nodes="compareConfig.config.nodes"
                    :selection="compareConfig.config.patient.goals" :changeable="false"/>
      </div>
        </ScrollPanel>
    </template>
  </Card>
</template>

<script>
import NodeInput from "@/components/InputFields/NodeInput";

export default {
  name: "GoalInput",
  components: {
  NodeInput
  },
    props: [
      "nodes",
      "selection",
        "compareConfig"
  ],
}
</script>

<style lang="scss" scoped>
.p-card {
  height: 100% !important;

}

::v-deep(.p-datatable-thead){
  display: None !important
}


</style>