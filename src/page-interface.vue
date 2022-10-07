<template>

  <tutorial @setBlock="block = $event"/>

  <Header ref="menu" @changePage="changePage()" @loadPatient="openLoadForm($event)"/>

  <OverlayPanel ref="panel">
    <LoadPatient @loaded="loadPatient"></LoadPatient>
  </OverlayPanel>

  <SelectButton v-model="Store.currentPhase" :options="Store.phases" aria-labelledby="single"
    class="p-d-flex p-ai-start p-mt-1 p-ml-1" optionLabel="name" />

  <div class=" p-grid stretched " style=" position:relative">
    <div class="p-col-3 p-ai-start p-flex-column stretched">
      <BlockUI class="p-pb-2" style="height: 30%;" :blocked="block.goals" ref="goal">
        <GoalInput/>
      </BlockUI>

      <BlockUI style="height:70%" :blocked="block.evidence">
        <EvidenceInput/>
      </BlockUI>

    </div>
    <BlockUI class="p-col stretched" :blocked="block.options">
      <TherapyOptions/>
    </BlockUI>

    <BlockUI class="p-col stretched" :blocked="block.explain">
      <Explanation />
    </BlockUI>
  </div>
</template>

<script>
import Header from "./components/page-header";
import Explanation from "./components/page-explanation";
import TherapyOptions from "@/components/InputFields/therapy-options";
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
    TherapyOptions,
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

      //add example nodes for the endometrial cancer network
      if (this.network === 'endometrial cancer') {
        let CA125 = this.Store.patient.nodes.find(x => x.name === "CA125")
        CA125["selected"] = {"name": "lt_35"}
        this.Store.addEvidences([CA125])
        this.Store.addTargets([this.Store.patient.nodes.find(x => x.name === "Therapy")])
        let surv = this.Store.patient.nodes.find(x => x.name === "Survival5yr")
        surv["selected"] = {"name": "yes"}
        let lnm = this.Store.patient.nodes.find(x => x.name === "LNM")
        lnm["selected"] = {"name": "no"}
        this.Store.addGoals([surv, lnm])
    }
  }
}
</script>

<style lang="scss" scoped>

.p-grid {
  margin-top: 0;
  margin-bottom: 0;
  margin-right: 0
}

.stretched {
  height: 100%;
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