<template>
 <Card style="position:relative">
    <template #title style="position: relative" :class="Evidence">
      Evidence
      <Button icon="pi pi-question" class="p-button-text p-button-secondary help" @click="$refs.op.toggle($event)" />
      <OverlayPanel ref="op" style="width:500px">
        Choose which variables are already set to a value. This will typically be your evidence and what you already
        know about the patient. Eg symptoms he shows, results of tests and personal information like age and gender.
      </OverlayPanel>
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

.help {
  position:absolute;
  right:5%
}

</style>