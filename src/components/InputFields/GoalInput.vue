<template>
 <Card>
    <template #title style="height:100%" :class="DesiredOutcomes" class="p-m-0 p-p-0">
      {{ $t("DesiredOutcomes") }}
      <Button icon="pi pi-question" class="p-button-text p-button-secondary help" @click="$refs.op.toggle($event)" />
      <OverlayPanel ref="op" style="width:500px">
        {{ $t("DesiredOutcomesHelp") }}
      </OverlayPanel>
    </template>
    <template #content style="height:100%" class="p-m-0 p-p-0">
      <ScrollPanel  style="height:100%">
        <div v-if="compareConfig == null">
      <NodeInput  title="Desired Outcomes" :nodes="nodes" :selection="selection" :changeable="true" :hideHeader="true"
                   @addNodes="$emit('addNodes', $event)" @deleteNode="$emit('deleteNode',$event)" :labels="labels"/>
        </div>
      <div v-else>
        <NodeInputCompare    title="Desired Outcomes" :nodes="nodes" :selection="selection" :name2="compareConfig.name"
                    :selection2="compareConfig.config.patient.goals" :changeable="false" :labels="labels"/>
      </div>
        </ScrollPanel>
    </template>
  </Card>
</template>

<script>
import NodeInput from "@/components/InputFields/NodeInput";
import NodeInputCompare from "@/components/InputFields/NodeInputCompare";

export default {
  name: "GoalInput",
  emits: ["addNodes", "deleteNode", "labels"],
  components: {
  NodeInput,
    NodeInputCompare
  },
    props: [
      "nodes",
      "selection",
        "compareConfig",
        "labels"
  ],
}
</script>

<style lang="scss" scoped>
.p-card {
  height: 100% !important;

}

.help {
  position:absolute;
  right:5%
}




</style>