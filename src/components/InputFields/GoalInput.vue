<template>
 <Card>
    <template #title style="height:100%" :class="DesiredOutcomes" class="p-m-0 p-p-0">
      {{ $t("DesiredOutcomes") }}
      <Button icon="pi pi-question" class="p-button-text p-button-secondary p-button-rounded p-button-raised help" @click="$refs.op.toggle($event)" />
      <OverlayPanel ref="op" style="width:500px">
        {{ $t("DesiredOutcomesHelp") }}
      </OverlayPanel>
    </template>
    <template #content style="height:100%" class="p-m-0 p-p-0">
      <ScrollPanel  style="height:100%">
        <div v-if="compareConfig == null">
      <NodeInput  title="Desired Outcomes" :changeable="true" :hideHeader="true" :selection="Store.patient.goals"
                   @addNodes="$emit('addNodes', $event)" @deleteNode="$emit('deleteNode',$event)"/>
        </div>
      <div v-else>
        <NodeInputCompare    title="Desired Outcomes" :name2="compareConfig.name" :selection="Store.patient.goals"
                    :selection2="compareConfig.config.patient.goals" :changeable="false" />
      </div>
        </ScrollPanel>
    </template>
  </Card>
</template>

<script>
import NodeInput from "@/components/InputFields/NodeInput";
import NodeInputCompare from "@/components/InputFields/NodeInputCompare";
import {useStore} from "@/store";

export default {
  name: "GoalInput",
  emits: ["addNodes", "deleteNode"],
  components: {
  NodeInput,
    NodeInputCompare
  },
    props: [
        "compareConfig"
  ],
  setup() {
    const Store = useStore()
    return { Store }
  },
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