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
        <EvidenceInput />
      </ScrollPanel>
    </template>

  </Card>
</template>

<script>
import EvidenceInput from "@/components/InputFields/evidence-input";
import {useStore} from '@/store'

export default {
  name: "evidence-input",
  components: {
    EvidenceInput
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