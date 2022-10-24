<template>

  <tutorial @setBlock="block = $event"/>

  <div class="flex flex-column h-full overflow-hidden">

  <Header class="flex" ref="menu" @changePage="changePage()" @loadPatient="openLoadForm($event)"/>

  <OverlayPanel ref="panel">
    <LoadPatient @loaded="loadPatient"></LoadPatient>
  </OverlayPanel>

  <div class="flex justify-content-between m-1">
      <SelectButton v-model="Store.currentPhase" :options="Store.phases" aria-labelledby="single"
    class="flex" optionLabel="name" @click="Store.phase_change()" />
    <Button class="flex" label="custom" @click="Store.currentPhase=null" />
  </div>

  <div class=" grid stretched flex flex-grow-1" style=" position:relative">
    <div class="col-3 flex-column stretched">
      <BlockUI class="pb-2" style="height: 30%;" :blocked="block.goals" ref="goal">
        <GoalInput/>
      </BlockUI>

      <BlockUI style="height:70%" :blocked="block.evidence">
        <EvidenceInput/>
      </BlockUI>

    </div>
    <BlockUI class="col stretched" :blocked="block.options">
      <Therapy/>
    </BlockUI>

    <BlockUI class="col stretched" :blocked="block.explain">
      <Explanation />
    </BlockUI>
  </div>

  </div>

</template>

<script>
import Header from "./components/page-header";
import Explanation from "./components/page-explanation";
import Therapy from "@/components/page-therapy";
import LoadPatient from "@/components/Header/load-patient";
import OverlayPanel from "primevue/overlaypanel";
import EvidenceInput from "@/components/InputFields/evidence-input";
import GoalInput from "@/components/InputFields/goal-input";
import tutorial from "@/components/page-tutorial";
import { useStore } from '@/store'

export default {
  name: "page-interface",
  emits: ["changePage"],
  components: {
    Header,
    Explanation,
    Therapy,
    LoadPatient,
    OverlayPanel,
    EvidenceInput,
    GoalInput,
    tutorial
  },
  props: [
    "network", "localNet"
  ],
  setup() {
    const Store = useStore()
    return { Store }
  },
  data() {
    return {
      block: {
        goals: false,
        evidence: true,
        options: true,
        explain: true
      },
    }
  },
  methods: {
    changePage() {
      this.$emit("changePage")
    },
    openLoadForm(event) {
      console.log(event)
      this.$refs.panel.toggle(event)
    },
    loadPatient: async function () {
      this.$refs.panel.toggle()
    }
    },
    created: async function () {
      this.Store.network = this.network
      this.Store.localNet = this.localNet
      await this.Store.loadNodes()
  }
}
</script>

<style lang="scss" scoped>

.grid {
  margin-top: 0;
  margin-bottom: 0;
  margin-right: 0
}

::v-deep(.p-card-content) {
  height: 90% !important;
}

::v-deep(.p-card-body) {
  height: 100% !important;
}

#arrow {
  width: 100%;
  height: 30%;
}

::v-deep(.p-scrollpanel) {
  .p-scrollpanel-bar {
    background-color: #b3b3b3;
    opacity: 1;
    transition: background-color .2s;
  }

}

::v-deep(.p-card-content) {
  padding-top: 0 !important;
}


</style>