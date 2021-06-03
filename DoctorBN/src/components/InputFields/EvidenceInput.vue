<template>
 <Card>
    <template #title style="position: relative" :class="Evidence">
      Evidence
    </template>
    <template #content>
      <NodeInput    title="Evidence" :nodes="nodes" :selection="selection" :changeable="true"
                   @addNodes="$emit('addNodes', $event)" @deleteNode="$emit('deleteNode',$event)"/>
      <div v-if="compareConfig">
        <divider />
        <h3> {{compareConfig.name}}:</h3>
      <NodeInput    title="Evidence" :nodes="compareConfig.config.nodes"
                    :selection="compareConfig.config.patient.evidence" :changeable="false"/>
      </div>
    </template>
  </Card>
</template>

<script>
import NodeInput from "@/components/InputFields/NodeInput";

export default {
name: "EvidenceInput",
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

<style scoped>
.p-card {
  height: 100% !important;

  display: grid;
  grid-template-rows: auto 1fr;
}

::v-deep(.p-panel-content) {
height: 100% !important;
}
</style>