<template>
 <Card>
    <template #title style="position: relative" :class="Evidence">
      Evidence
    </template>
    <template #content>
      <ScrollPanel  style="height:100%">
      <NodeInput  v-if="compareConfig == null"  title="Evidence" :nodes="nodes" :selection="selection" :changeable="true"
                   @addNodes="$emit('addNodes', $event)" @deleteNode="$emit('deleteNode',$event)"/>

      <NodeInputCompare  v-else  title="Evidence" :nodes="nodes" :name2="compareConfig.name"
                    :selection="selection" :selection2="compareConfig.config.patient.evidence" :changeable="false"/>
      </ScrollPanel>
    </template>

  </Card>
</template>

<script>
import NodeInput from "@/components/InputFields/NodeInput";
import NodeInputCompare from "@/components/InputFields/NodeInputCompare";

export default {
name: "EvidenceInput",
  components: {
  NodeInput,
    NodeInputCompare
  },
    props: [
      "nodes",
      "selection",
        "compareConfig"
  ],
  data() {
  return {
    editMode: true
  }
  }
}
</script>

<style scoped>
.p-card {
  height: 100% !important;
}


</style>