<template>

  <tutorial @setBlock="block = $event"/>

  <Header ref="menu" @changePage="changePage()" @reset="reset()" @loadPatient="openLoadForm($event)"
          @exportCSV="exportCSV($event)" @saveConfig="saveConfig($event)" @compareTo="compareTo($event)"
          :configurations="configurations" @load="loadConfig($event)" @deleteConfig="deleteConfig($event)"
          :NetworkName="network" :PatientName="patient.name" @setName="patient.name = $event"
          :description="description" @sendFeedback="sendFeedback($event)"/>

  <OverlayPanel ref="panel">
    <load-patient @loaded="loadPatient"></load-patient>
  </OverlayPanel>

  <div class=" p-grid stretched " style=" position:relative">
    <div class="p-col-3 p-ai-start p-flex-column stretched">
      <BlockUI class="p-pb-2 p-d-flex" style="height: 30%;" :blocked="block.goals" ref="goal">
        <GoalInput :nodes="patient.nodes" :selection="patient.goals" :compareConfig="selectedConfig"
                   @addNodes="addGoals($event)" @deleteNode="deleteGoal($event)"/>
      </BlockUI>

      <BlockUI style="height:70%" :blocked="block.evidence">
        <EvidenceInput :nodes="patient.nodes" :selection="patient.evidence" :compareConfig="selectedConfig"
                       @addNodes="addEvidences($event)" @deleteNode="deleteEvidence($event)"/>
      </BlockUI>


    </div>
    <BlockUI class="p-col stretched" :blocked="block.options">
      <TherapyOptions :results="options.options" :goals="newGoals"
                      :selectedOption="options.selectedOption" @update="selectedOptionUpdated($event)"
                      :nodes="patient.nodes" :targets="patient.targets" :loading="optionsLoading"
                      :compareConfig="selectedConfig"
                      @addNodes="addTargets($event)" @deleteNode="deleteTarget($event)"/>

    </BlockUI>
    <BlockUI class="p-col stretched" :blocked="block.explain">
      <Explanation :goals="newGoals" :edges="edges" :explain="explain" :loading="explanationLoading"
                   :compareConfig="selectedConfig" :selectedOption="options.selectedOption"/>

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

export default {
  name: "Interface",
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
    "network"
  ],
  data() {
    return {
      //data that is specific to the patient
      patient: {
        targets: [],
        evidence: [],
        goals: [],
        nodes: [], //nodes of the network that are neither evidence, goals, nor targets
        name: ""
      },

      //available options to treat the patient given the interventions
      options: {
        options: null,
        selectedOption: null,
      },

      newGoals: null, //helper property to let the data tables update TODO: replace
      edges: null, //edges of the network

      //explaining calculations for the chosen option
      explain: {
        explanation: null,
        relevance: null,
        states: null,
      },

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

      description: "no description"
    }
  },
  methods: {
    saveConfig(name) {
      this.configurations.push({
        "name": name,
        "config": {
          "patient": JSON.parse(JSON.stringify(this.patient)),
          "options": JSON.parse(JSON.stringify(this.options)),
          "explain": JSON.parse(JSON.stringify(this.explain)),
          "newGoals": JSON.parse(JSON.stringify(this.newGoals))
        }
      })
    },
    deleteConfig(name) {
      this.configurations = this.configurations.filter(a => a.name !== name)
    },
    loadConfig(name) {
      let configuration = this.configurations.find(a => a.name === name)
      this.patient = configuration.config.patient
      this.options = configuration.config.options
      this.explain = configuration.config.explain
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
      this.patient.name = name
      console.log("Patient: " + name)
      this.$refs.panel.toggle()
    },
    getCorrespondingNode(nodeArr) {
      let correspondingNodes = []
      nodeArr.forEach(node => {
        let correspondingNode = this.patient.nodes.find(x => x.name === node.name)
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
      const gResponse = await fetch("https://doctorbn-backend.herokuapp.com/getNetwork?network=" + this.network);
      const network = await gResponse.json();
      let nodes = []
      for (var key in network.states) {
        let options = []
        network.states[key].forEach(value => {
          options.push({'name': value})
        })
        nodes.push({'name': key, 'options': options})
      }
      this.patient.nodes = nodes

      let edges = []
      network.edges.forEach(edge => {
        edges.push({"source": edge[0], "target": edge[1]})
      })
      this.edges = edges

      this.description = network.description
    },
    reset: async function () {
      this.patient.targets = []
      this.patient.evidence = []
      this.patient.goals = []
      this.patient.nodes = []
      this.patient.name = ""

      this.options.options = null
      this.options.selectedOption = null

      this.edges = null
      this.newGoals = null

      this.explain.relevance = null
      this.explain.states = null
      this.explain.explanation = null

      await this.loadNodes()
    },
    calculate: async function () {
      if (this.patient.evidence.length !== 0 && this.patient.targets.length !== 0 && this.patient.goals.length !== 0) {
        this.optionsLoading = true
        this.explanationLoading = true

        let evidences = {}
        for (var ev in this.patient.evidence) {
          evidences[this.patient.evidence[ev].name] = this.patient.evidence[ev].selected.name;
        }
        let goals = {}
        for (var goal in this.patient.goals) {
          goals[this.patient.goals[goal].name] = this.patient.goals[goal].selected.name;
        }

        let targets = []
        for (var target in this.patient.targets) {
          targets.push(this.patient.targets[target].name)
        }

        const gResponse = await fetch("https://doctorbn-backend.herokuapp.com/calcTargetForGoals", {
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
        let nodeDict = await gResponse.json();
        this.options.options = nodeDict.optionResults
        this.options.selectedOption = nodeDict.optionResults[0]

        this.newGoals = goals
        this.optionsLoading = false
        this.calculateOption()
      }
    },
    calculateOption: async function () {
      this.explanationLoading = true

      let evidences = {}
      for (var ev in this.patient.evidence) {
        evidences[this.patient.evidence[ev].name] = this.patient.evidence[ev].selected.name;
      }

      let goals = {}
      for (var goal in this.patient.goals) {
        goals[this.patient.goals[goal].name] = this.patient.goals[goal].selected.name;
      }

      const gResponse = await fetch("https://doctorbn-backend.herokuapp.com/calcOptions", {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          network: this.network,
          evidences: evidences,
          options: this.options.selectedOption.option,
          goals: goals
        })
      });
      let nodeDict = await gResponse.json();
      this.explain.relevance = nodeDict.relevance
      this.newGoals = goals
      this.explain.states = nodeDict.nodes
      this.explain.explanation = nodeDict.explanation
      this.explanationLoading = false
    },
    addEvidences(nodes) {
      nodes.forEach(node => {
        this.patient.evidence = this.patient.evidence.filter(x => x.name !== node.name)
        this.patient.nodes = this.patient.nodes.filter(x => x.name !== node.name)
        this.patient.evidence.push(node)
      })
      this.calculate()
    },
    deleteEvidence(node) {
      this.patient.evidence = this.patient.evidence.filter(x => x.name !== node.name)
      this.patient.nodes.push({name: node.name, options: node.options})
      this.calculate()
    },
    addTargets(nodes) {
      nodes.forEach(node => {
        this.patient.targets.push(node)
        this.patient.nodes = this.patient.nodes.filter(x => x.name !== node.name)
      })
      this.calculate()
    },
    deleteTarget(node) {
      this.patient.targets = this.patient.targets.filter(x => x.name !== node.name)
      this.patient.nodes.push(node)
      this.calculate()
    },
    addGoals(nodes) {
      nodes.forEach(node => {
        this.patient.goals = this.patient.goals.filter(x => x.name !== node.name)
        this.patient.nodes = this.patient.nodes.filter(x => x.name !== node.name)
        this.patient.goals.push(node)
      })
      this.calculate()
    },
    deleteGoal(node) {
      this.patient.goals = this.patient.goals.filter(x => x.name !== node.name)
      this.patient.nodes.push({name: node.name, options: node.options})
      this.calculate()
    },
    selectedOptionUpdated(option) {
      this.options.selectedOption = option
      if (option === []) this.explain.relevance = null
      else {
        this.calculateOption()
      }
    },
    createCSVcontent() {
      var csv = "Type; Variable; Option"
      this.patient.evidence.forEach(ev => {
        csv += "\nevidence; " + ev.name + "; " + ev.selected.name
      })
      this.patient.targets.forEach(ev => {
        csv += "\ntarget; " + ev.name
      })
      this.patient.goals.forEach(ev => {
        csv += "\ngoal; " + ev.name + "; " + ev.selected.name
      })
      return csv
    },
    exportCSV(name) {
      this.patient.name = name
      const csv = this.createCSVcontent();

      const anchor = document.createElement('a');
      anchor.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
      anchor.target = '_blank';
      anchor.download = name + '.csv';
      anchor.click();
    },
    async sendFeedback(description) {
      const csv = this.createCSVcontent();

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

    if (this.network === 'Endometric cancer') {
      //add example nodes
      let CA125 = this.patient.nodes.find(x => x.name === "CA125")
      CA125["selected"] = {"name": "lt_35"}
      this.addEvidences([CA125])
      this.addTargets([this.patient.nodes.find(x => x.name === "Therapy")])
      let surv = this.patient.nodes.find(x => x.name === "Survival1yr")
      surv["selected"] = {"name": "yes"}
      this.addGoals([surv])
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