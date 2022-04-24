<template>

  <tutorial @setBlock="block = $event"/>

  <Header ref="menu" @changePage="changePage()" @reset="reset()" @loadPatient="openLoadForm($event)"
          @exportCSV="exportCSV($event)" @saveConfig="saveConfig($event)" @compareTo="compareTo($event)"
          :configurations="configurations" @load="loadConfig($event)" @deleteConfig="deleteConfig($event)"
          :NetworkName="network"
          description="Not working" @sendFeedback="sendFeedback($event)"/>

  <OverlayPanel ref="panel">
    <load-patient @loaded="loadPatient"></load-patient>
  </OverlayPanel>

  <div class=" p-grid stretched " style=" position:relative">
    <div class="p-col-3 p-ai-start p-flex-column stretched">
      <BlockUI class="p-pb-2 p-d-flex" style="height: 30%;" :blocked="block.goals" ref="goal">
        <GoalInput :compareConfig="selectedConfig"
                   @addNodes="addGoals($event)" @deleteNode="deleteGoal($event)"/>
      </BlockUI>

      <BlockUI style="height:70%" :blocked="block.evidence">
        <EvidenceInput :compareConfig="selectedConfig"
                       @addNodes="addEvidences($event)" @deleteNode="deleteEvidence($event)"/>
      </BlockUI>


    </div>
    <BlockUI class="p-col stretched" :blocked="block.options">
      <TherapyOptions  :goals="newGoals"
                      @update="selectedOptionUpdated($event)"
                      :loading="optionsLoading"
                      :compareConfig="selectedConfig"
                      @addNodes="addTargets($event)" @deleteNode="deleteTarget($event)"/>

    </BlockUI>
    <BlockUI class="p-col stretched" :blocked="block.explain">
      <Explanation :goals="newGoals" :loading="explanationLoading"
                   :compareConfig="selectedConfig" />

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

      newGoals: null, //helper property to let the data tables update TODO: replace

      configurations: [],
      selectedConfig: null,
      patientCases: [],

      optionsLoading: false,
      explanationLoading: false,

      block: {
        goals: false,
        evidence: true,
        options: true,
        explain: true
      },
    }
  },
  methods: {
    saveConfig(name) {
      this.configurations.push({
        "name": name,
        "config": {
          "patient": JSON.parse(JSON.stringify(this.Store.patient)),
          "options": JSON.parse(JSON.stringify(this.Store.options)),
          "explain": JSON.parse(JSON.stringify(this.Store.explain)),
          "newGoals": JSON.parse(JSON.stringify(this.newGoals))
        }
      })
    },
    deleteConfig(name) {
      this.configurations = this.configurations.filter(a => a.name !== name)
    },
    loadConfig(name) {
      let configuration = this.configurations.find(a => a.name === name)
      this.Store.patient = configuration.config.patient
      this.Store.options = configuration.config.options
      this.Store.explain = configuration.config.explain
      this.newGoals = configuration.config.newGoals
    },
    compareTo(name) {
      this.selectedConfig = this.configurations.find(a => a.name === name)
    },
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
    loadNodes: async function () {
      let gResponse = null
      if (this.localNet) {
        gResponse = await fetch("https://doctorbn-backend.herokuapp.com/getLocalNetwork", {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            fileString: this.localNet.fileString,
            fileFormat: this.localNet.fileFormat,
            description: this.localNet.description
          })
        });
      }
      else {
        gResponse = await fetch("https://doctorbn-backend.herokuapp.com/getNetwork?network=" + this.network);
      }
      const network = await gResponse.json();
      let nodes = []
      for (var key in network.states) {
        let options = []
        network.states[key].forEach(value => {
          options.push({'name': value})
        })
        nodes.push({'name': key, 'options': options})
      }
      this.Store.patient.nodes = nodes

      let edges = []
      network.edges.forEach(edge => {
        edges.push({"source": edge[0], "target": edge[1]})
      })
      this.Store.edges = edges

      this.Store.description = network.description
      this.Store.labels = network.labels
    },
    reset: async function () {
      this.Store.patient.targets = []
      this.Store.patient.evidence = []
      this.Store.patient.goals = []
      this.Store.patient.nodes = []
      this.Store.patient.name = ""

      this.Store.options.options = null
      this.Store.options.selectedOption = null
      this.Store.options.likelyResult = null

      this.Store.edges = null
      this.newGoals = null

      this.Store.explain.relevance = null
      this.Store.explain.states = null
      this.Store.explain.explanation = null

      await this.loadNodes()
    },
    calculate: async function () {
      if (this.Store.patient.evidence.length !== 0 && this.Store.patient.goals.length !== 0) {
        this.Store.optionsLoading = true
        this.explanationLoading = true

        let evidences = {}
        for (var ev in this.Store.patient.evidence) {
          evidences[this.Store.patient.evidence[ev].name] = this.Store.patient.evidence[ev].selected.name;
        }
        let goals = {}
        for (var goal in this.Store.patient.goals) {
          goals[this.Store.patient.goals[goal].name] = this.Store.patient.goals[goal].selected.name;
        }

        let targets = []
        for (var target in this.Store.patient.targets) {
          targets.push(this.Store.patient.targets[target].name)
        }
        let gResponse = null
        if (this.localNet) {
           gResponse = await fetch("https://doctorbn-backend.herokuapp.com/calcTargetForGoals", {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            network: this.network,
            fileString: this.localNet.fileString,
            fileFormat: this.localNet.fileFormat,
            evidences: evidences,
            target: targets,
            goals: goals
          })
        });
        }
        else {
           gResponse = await fetch("https://doctorbn-backend.herokuapp.com/calcTargetForGoals", {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            network: this.network,
            evidences: evidences,
            target: targets,
            goals: goals
          })
        });
        }

        let nodeDict = await gResponse.json();
        if (this.Store.patient.targets.length !== 0) {
                  this.Store.options.options = nodeDict.optionResults
        }
        else {
          this.Store.options.options = []
        }
        this.Store.options.likelyResult = [{
          option: {}, value: nodeDict.likelyResults.value,
          goalValues: nodeDict.likelyResults.goalValues
        }]
        this.Store.options.selectedOption = this.Store.options.likelyResult[0]

        this.newGoals = goals
        this.Store.optionsLoading = false
        this.calculateOption()
      }
    },
    calculateOption: async function () {
      this.explanationLoading = true

      let evidences = {}
      for (var ev in this.Store.patient.evidence) {
        evidences[this.Store.patient.evidence[ev].name] = this.Store.patient.evidence[ev].selected.name;
      }

      let goals = {}
      for (var goal in this.Store.patient.goals) {
        goals[this.Store.patient.goals[goal].name] = this.Store.patient.goals[goal].selected.name;
      }
      let gResponse = null
      if (this.localNet) {
        gResponse = await fetch("https://doctorbn-backend.herokuapp.com/calcOptions", {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          network: this.network,
          fileString: this.localNet.fileString,
          fileFormat: this.localNet.fileFormat,
          evidences: evidences,
          options: this.Store.options.selectedOption.option,
          goals: goals
        })
      });
      }
      else {
        gResponse = await fetch("https://doctorbn-backend.herokuapp.com/calcOptions", {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          network: this.network,
          evidences: evidences,
          options: this.Store.options.selectedOption.option,
          goals: goals
        })
      });
      }

      let nodeDict = await gResponse.json();
      this.Store.explain.relevance = nodeDict.relevance
      this.newGoals = goals
      this.Store.explain.states = nodeDict.nodes
      this.Store.explain.explanation = nodeDict.explanation
      this.explanationLoading = false
    },
    addEvidences(nodes) {
      nodes.forEach(node => {
        this.Store.patient.evidence = this.Store.patient.evidence.filter(x => x.name !== node.name)
        this.Store.patient.nodes = this.Store.patient.nodes.filter(x => x.name !== node.name)
        this.Store.patient.evidence.push(node)
      })
      this.calculate()
    },
    deleteEvidence(node) {
      this.Store.patient.evidence = this.Store.patient.evidence.filter(x => x.name !== node.name)
      this.Store.patient.nodes.push({name: node.name, options: node.options})
      this.calculate()
    },
    addTargets(nodes) {
      nodes.forEach(node => {
        this.Store.patient.targets.push(node)
        this.Store.patient.nodes = this.Store.patient.nodes.filter(x => x.name !== node.name)
      })
      this.calculate()
    },
    deleteTarget(node) {
      this.Store.patient.targets = this.Store.patient.targets.filter(x => x.name !== node.name)
      this.Store.patient.nodes.push(node)
      this.calculate()
    },
    addGoals(nodes) {
      nodes.forEach(node => {
        this.Store.patient.goals = this.Store.patient.goals.filter(x => x.name !== node.name)
        this.Store.patient.nodes = this.Store.patient.nodes.filter(x => x.name !== node.name)
        this.Store.patient.goals.push(node)
      })
      this.calculate()
    },
    deleteGoal(node) {
      this.Store.patient.goals = this.Store.patient.goals.filter(x => x.name !== node.name)
      this.Store.patient.nodes.push({name: node.name, options: node.options})
      this.calculate()
    },
    selectedOptionUpdated(option) {
      option === null? this.Store.options.selectedOption = this.Store.options.likelyResult[0] : this.Store.options.selectedOption = option
      console.log(this.Store.options.selectedOption)
      if (option === []) this.Store.explain.relevance = null
      else {
        this.calculateOption()
      }
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
    await this.loadNodes()

    if (this.network === 'endometrial cancer') {
      //add example nodes
      let CA125 = this.Store.patient.nodes.find(x => x.name === "CA125")
      CA125["selected"] = {"name": "lt_35"}
      this.addEvidences([CA125])
      this.addTargets([this.Store.patient.nodes.find(x => x.name === "Therapy")])
      let surv = this.Store.patient.nodes.find(x => x.name === "Survival5yr")
      surv["selected"] = {"name": "yes"}
      let lnm = this.Store.patient.nodes.find(x => x.name === "LNM")
      lnm["selected"] = {"name": "no"}
      this.addGoals([surv, lnm])
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