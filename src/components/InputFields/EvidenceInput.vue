<template>
 <Card style="position:relative">
    <template #title style="position: relative" :class="Evidence">
      {{ $t("Evidence") }}
      <Button icon="pi pi-question" class="p-button-text p-button-secondary p-button-rounded p-button-raised help" @click="$refs.op.toggle($event)" />
      <OverlayPanel ref="op" style="width:500px">
          {{ $t("EvidenceHelp") }}
      </OverlayPanel>
    </template>
    <template #content>
      <ScrollPanel  style="height:100%">
      <NodeInput  v-if="Store.selectedConfig == null"  title="Evidence" :changeable="true" :selection="Store.patient.evidence"
                   @addNodes="$emit('addNodes', $event)" @deleteNode="$emit('deleteNode',$event)"/>

      <NodeInputCompare  v-else  title="Evidence" :name2="Store.selectedConfig.name" :selection="Store.patient.evidence"
                    :selection2="Store.selectedConfig.config.patient.evidence" :changeable="false"/>
      </ScrollPanel>
    </template>

  </Card>
</template>

<script>
import NodeInput from "@/components/InputFields/NodeInput";
import NodeInputCompare from "@/components/InputFields/NodeInputCompare";
import { useStore } from '@/store'

export default {
name: "EvidenceInput",
  emits: ["addNodes","deleteNode"],
  components: {
  NodeInput,
    NodeInputCompare
  },
  setup() {
    const Store = useStore()
    return { Store }
  },
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