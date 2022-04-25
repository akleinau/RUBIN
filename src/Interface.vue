<template>

  <tutorial @setBlock="block = $event"/>

  <Header ref="menu" @changePage="changePage()" @reset="reset()" @loadPatient="openLoadForm($event)"
          @exportCSV="exportCSV($event)" @sendFeedback="sendFeedback($event)"/>

  <OverlayPanel ref="panel">
    <load-patient @loaded="loadPatient"></load-patient>
  </OverlayPanel>

  <div class=" p-grid stretched " style=" position:relative">
    <div class="p-col-3 p-ai-start p-flex-column stretched">
      <BlockUI class="p-pb-2 p-d-flex" style="height: 30%;" :blocked="block.goals" ref="goal">
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
import Header from "./components/Header";
import Explanation from "./components/Explanation";
import TherapyOptions from "@/components/InputFields/TherapyOptions";
import LoadPatient from "@/components/Header/LoadPatient";
import OverlayPanel from "primevue/overlaypanel";
import EvidenceInput from "@/components/InputFields/EvidenceInput";
import GoalInput from "@/components/InputFields/GoalInput";
import tutorial from "@/components/tutorial";
import { useStore } from '@/store'

export default {
  name: "Interface",
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
    loadPatient: async function (patientData, name) {
      await this.reset()
      let evidenceNodes = this.getCorrespondingNode(patientData.evidence)
      let targetNodes = this.getCorrespondingNode(patientData.targets)
      let goalNodes = this.getCorrespondingNode(patientData.goals)
      this.addEvidences(evidenceNodes)
      this.addTargets(targetNodes)
      this.addGoals(goalNodes)
      this.Store.patient.name = name
      console.log("Patient: " + name)
      this.$refs.panel.toggle()
    },
    getCorrespondingNode(nodeArr) {
      let correspondingNodes = []
      nodeArr.forEach(node => {
        let correspondingNode = this.Store.patient.nodes.find(x => x.name === node.name)
        let item = {
          name: correspondingNode.name,
          selected: {name: node.option},
          options: correspondingNode.options
        }
        correspondingNodes.push(item)
      })
      return correspondingNodes
    },

    reset: async function () {
      this.Store.$reset()
      await this.Store.loadNodes()
    },
    calculate: async function () {
      this.Store.network = this.network
      this.Store.localNet = this.localNet
      await this.Store.calculate()
    },
    createCSVcontent() {
      var csv = "Type; Variable; Option"
      this.Store.patient.evidence.forEach(ev => {
        csv += "\nevidence; " + ev.name + "; " + ev.selected.name
      })
      this.Store.patient.targets.forEach(ev => {
        csv += "\ntarget; " + ev.name
      })
      this.Store.patient.goals.forEach(ev => {
        csv += "\ngoal; " + ev.name + "; " + ev.selected.name
      })
      return csv
    },
    exportCSV(name) {
      this.Store.patient.name = name
      const csv = this.createCSVcontent();

      const anchor = document.createElement('a');
      anchor.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
      anchor.target = '_blank';
      anchor.download = name + '.csv';
      anchor.click();
    },
    async sendFeedback(description, addConfig) {
      let csv = "NONE"
      if (addConfig) {
        csv = this.createCSVcontent();
      }

      const gResponse = await fetch("https://doctorbn-backend.herokuapp.com/sendFeedback", {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          description: description,
          csv: csv
        })
      });
      const response = await gResponse;
      console.log(response)
    }
  },
  created: async function () {
    this.Store.network = this.network
    this.Store.localNet = this.localNet
    await this.Store.loadNodes()

    if (this.network === 'endometrial cancer') {
      //add example nodes
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