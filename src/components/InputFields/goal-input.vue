<template>
 <Card class="DesiredOutcomes"  style="height:100%">
    <template #title>
      {{ $t("DesiredOutcomes") }}
      <Button icon="pi pi-question" class="p-button-text p-button-secondary p-button-rounded p-button-raised help" @click="$refs.op.toggle($event)" />
      <OverlayPanel ref="op" style="width:500px">
        {{ $t("DesiredOutcomesHelp") }}
      </OverlayPanel>
    </template>
    <template #content>
      <ScrollPanel  style="height:100%">
      <NodeInput v-if="Store.selectedConfig == null"  title="Desired Outcomes" :changeable="true" :hideHeader="true" :selection="Store.patient.goals"
                   @addNodes="Store.addGoals($event)" @deleteNode="Store.deleteGoal($event)"/>
      <div v-else>
        <NodeInputCompare    title="Desired Outcomes" :name2="Store.selectedConfig.name" :selection="Store.patient.goals"
                    :selection2="Store.selectedConfig.config.patient.goals" :changeable="false" />
      </div>
        </ScrollPanel>
    </template>
  </Card>
</template>

<script>
import NodeInput from "@/components/InputFields/node-input";
import NodeInputCompare from "@/components/InputFields/node-input-compare";
import {useStore} from "@/store";

export default {
  name: "goal-input",
  components: {
  NodeInput,
    NodeInputCompare
  },
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