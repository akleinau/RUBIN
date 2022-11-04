<template>
  <Card style="position:relative" class="Evidence">
    <template #title>
      {{ $t("Evidence") }}
      <Button icon="pi pi-question" class="p-button-outlined p-button-secondary p-button-rounded p-button-raised help"
              @click="$refs.op.toggle($event)"/>
      <OverlayPanel ref="op" style="width:500px">
        {{ $t("EvidenceHelp") }}
      </OverlayPanel>
    </template>
    <template #content>
      <ScrollPanel style="height:100%">
        <NodeInput v-if="Store.selectedConfig == null" title="Evidence" :changeable="true"
                   :selection="Store.patient.evidence"
                   @addNodes="Store.addEvidences($event)" @deleteNode="Store.deleteEvidence($event)"/>

        <NodeInputCompare v-else title="Evidence" :name2="Store.selectedConfig.name" :selection="Store.patient.evidence"
                          :selection2="Store.selectedConfig.config.patient.evidence" :changeable="false"/>
      </ScrollPanel>
    </template>

  </Card>
</template>

<script>
import NodeInput from "@/components/InputFields/node-input";
import NodeInputCompare from "@/components/InputFields/node-input-compare";
import {useStore} from '@/store'

export default {
  name: "evidence-input",
  components: {
    NodeInput,
    NodeInputCompare
  },
  setup() {
    const Store = useStore()
    return {Store}
  },
}
</script>

<style scoped>
.p-card {
  height: 100% !important;
}

.help {
  position: absolute;
  right: 5%
}

</style>