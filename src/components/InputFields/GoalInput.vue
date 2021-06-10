<template>
 <Card>
    <template #title style="height:100%" :class="DesiredOutcomes">
      Desired Outcomes
      <Button icon="pi pi-question" class="p-button-text p-button-secondary help" @click="$refs.op.toggle($event)" />
      <OverlayPanel ref="op" style="width:500px">
        Choose which nodes you want to have a specific value. For example, if you want the patient to survive, you can
        choose the 'Survival' node and set it to 'yes'. The network will consider this in it's calculations.
      </OverlayPanel>
    </template>
    <template #content style="height:100%">
      <ScrollPanel  style="height:100%">
        <div v-if="compareConfig == null">
      <NodeInput  title="Desired Outcomes" :nodes="nodes" :selection="selection" :changeable="true" :hideHeader="true"
                   @addNodes="$emit('addNodes', $event)" @deleteNode="$emit('deleteNode',$event)"/>
        </div>
      <div v-else>
        <NodeInputCompare    title="Desired Outcomes" :nodes="nodes" :selection="selection" :name2="compareConfig.name"
                    :selection2="compareConfig.config.patient.goals" :changeable="false"/>
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
  components: {
  NodeInput,
    NodeInputCompare
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

.help {
  position:absolute;
  right:5%
}




</style>