<template>

  <tutorial @setBlock="block = $event"/>

  <div class="flex flex-column h-full">

    <Header class="flex" ref="menu" @changePage="changePage()" @loadPatient="openLoadForm($event)"/>

    <OverlayPanel ref="panel">
      <LoadPatient @loaded="loadPatient"></LoadPatient>
    </OverlayPanel>

    <!-- phases -->
    <div class="flex justify-content-between m-1">
      <SelectButton v-model="Store.currentPhase" :options="Store.phases" aria-labelledby="single"
                    class="flex" optionLabel="name" @click="Store.phase_change()"/>
      <Button class="flex" label="custom" @click="Store.currentPhase=null"/>
    </div>

    <!-- main cards -->
    <div class=" grid flex flex-grow-1 h-full overflow-hidden relative">
      <div class="col-3 flex-column">
        <BlockUI class="pb-2" style="height: 30%;" :blocked="block.goals" ref="goal">
          <GoalInput/>
        </BlockUI>

        <BlockUI style="height:70%" :blocked="block.evidence">
          <EvidenceInput/>
        </BlockUI>

      </div>
      <BlockUI class="col" :blocked="block.options">
        <Therapy/>
      </BlockUI>

      <BlockUI class="col h-full" :blocked="block.explain">
        <Explanation class="h-full"/>
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
import {useStore} from '@/store'

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
    return {Store}
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

</style>