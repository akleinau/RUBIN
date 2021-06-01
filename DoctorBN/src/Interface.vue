<template>

  <Header ref="menu" @changePage="changePage()" @reset="reset()" @loadPatient="openLoadForm($event)"
          @exportCSV="exportCSV($event)" @saveConfig="saveConfig($event)" @compareTo="compareTo($event)"
          :configurations="configurations"/>

  <OverlayPanel ref="panel">
    <load-patient @loaded="loadPatient"></load-patient>
  </OverlayPanel>

  <div class=" p-grid  nested-grid  vertical-container " style="height:100%">
    <div class="p-grid p-col-3 p-flex-column ">
           <div class="p-col">
        <NodeInput title="Desired Outcomes" :nodes="nodes" :selection="patient.goals"
                   @addNodes="addGoals($event)" @deleteNode="deleteGoal($event)" />
      </div>
      <div class="p-col box box-stretched ">
        <NodeInput    title="Evidence" :nodes="nodes" :selection="patient.evidence"
                   @addNodes="addEvidences($event)" @deleteNode="deleteEvidence($event)"/>
      </div>



    </div>
    <div class="p-col p-grid p-flex-column" style="position:relative">

            <div class="p-col box-stretched" >
        <TherapyOptions :results="options.options" :goals="newGoals" :goalResults="options.optionResults"
                        :selectedOption="options.selectedOption" @update="selectedOptionUpdated($event)"
                  :nodes="nodes" :targets="patient.targets"
                 @addNodes="addTargets($event)" @deleteNode="deleteTarget($event)"/>
      </div>
      </div>
      <div class="p-col p-grid p-flex-column" style="position:relative">
        <div class="p-col box-stretched">
        <Network :relevance = "explain.relevance" :goals="newGoals" :edges="edges" :nodes="explain.states" :explanation="explain.explanation"/>
          </div>
      </div>
  </div>
</template>

<script>
import Header from "./components/Header";
import NodeInput from "./components/NodeInput";
import Network from "./components/Network";
import TherapyOptions from "@/components/TherapyOptions";
import LoadPatient from "@/components/LoadPatient";
import OverlayPanel from "primevue/overlaypanel";

export default {
  name: "Interface",
  components: {
    Header,
    NodeInput,
    Network,
    TherapyOptions,
    LoadPatient,
    OverlayPanel
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
      },

      //available options to treat the patient given the interventions
      options: {
        options: null,
        optionResults: null,
        selectedOption: null,
      },

      newGoals: null, //helper property to let the data tables update TODO: replace
      nodes: [], //nodes of the network that are neither evidence, goals, nor targets
      edges: null, //edges of the network

      //explaining calculations for the chosen option
      explain: {
        explanation: null,
        relevance: null,
        states: null,
      },

      configurations: [],
      selectedConfig: null,
      patientCases: []
    }
  },
  methods: {
    saveConfig(name) {
      this.configurations.push({
        "name": name,
        "config": {
          "patient": this.patient,
          "options": this.options,
          "explain": this.explain,
          "nodes": this.nodes,
          "newGoals": this.newGoals
        }
      })
    },
    compareTo(name) {
      this.selectedConfig = this.configurations.find(a => a.name === name)
    },
    changePage() {
      this.$emit("changePage")
    },
    openLoadForm(event) {
      this.$refs.panel.toggle(event)
    },
    loadPatient: async function(patientData) {
      await this.reset()
      let evidenceNodes = this.getCorrespondingNode(patientData.evidence)
      let targetNodes = this.getCorrespondingNode(patientData.targets)
      let goalNodes = this.getCorrespondingNode(patientData.goals)
      this.addEvidences(evidenceNodes)
      this.addTargets(targetNodes)
      this.addGoals(goalNodes)
      this.$refs.panel.toggle()
    },
    getCorrespondingNode(nodeArr) {
      let correspondingNodes = []
      nodeArr.forEach(node => {
        console.log("selectedOption:")
        console.log(node)
        let correspondingNode = this.nodes.find(x => x.name === node.name)
        let item = {
          name: correspondingNode.name,
          selected: {name: node.option},
          options: correspondingNode.options
        }
        correspondingNodes.push(item)
      })
      return correspondingNodes
    },
    loadNodes: async function(){
      const gResponse = await fetch("http://localhost:5000/cancernet?network=" + this.network);
      const network = await gResponse.json();
      let nodes = []
      for (var key in network.states) {
        let options = []
        network.states[key].forEach(value => {
          options.push({'name': value})
        })
        nodes.push({'name': key, 'options': options})
      }
      this.nodes = nodes
      console.log(nodes)

      let edges = []
      network.edges.forEach(edge => {
        edges.push({"source": edge[0], "target": edge[1]})
      })
      this.edges = edges
      console.log("edges: ")
      console.log(edges)
    },
    reset: async function() {
      this.patient.targets= []
      this.patient.evidence= []
      this.patient.goals= []

      this.options.options= null
      this.options.optionResults= null
      this.options.selectedOption= null

      this.edges= null
      this.nodes= []
      this.newGoals= null

      this.explain.relevance= null
      this.explain.states= null
      this.explain.explanation= null

      await this.loadNodes()
    },
    calculate: async function () {
      if (this.patient.evidence.length !== 0 && this.patient.targets.length !== 0 && this.patient.goals.length !== 0) {
        console.log("doing calculation for:")

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

        console.log(targets)
        console.log(evidences)
        console.log(goals)

        const gResponse = await fetch("http://localhost:5000/calcTargetForGoals", {
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
        console.log('results: ')
        console.log(nodeDict.optionResults)
        this.options.options = nodeDict.optionResults
        console.log(nodeDict.likelyResults)
        this.options.optionResults = nodeDict.likelyResults

        this.newGoals = goals

      }
    },
    calculateOption: async function () {
      console.log("calculating relevance for:")
      console.log(this.options.selectedOption)

      let evidences = {}
      for (var ev in this.patient.evidence) {
        evidences[this.patient.evidence[ev].name] = this.patient.evidence[ev].selected.name;
      }
      console.log(evidences)

      let goals = {}
      for (var goal in this.patient.goals) {
        goals[this.patient.goals[goal].name] = this.patient.goals[goal].selected.name;
      }

      console.log(goals)

      const gResponse = await fetch("http://localhost:5000/calcOptions", {
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
      console.log('relevance: ')
      this.explain.relevance = nodeDict.relevance
      console.log(this.explain.relevance)
      this.newGoals = goals
      this.explain.states = nodeDict.nodes
      console.log(this.explain.states)
      this.explain.explanation = nodeDict.explanation
      console.log(this.explain.explanation)
    },
    addEvidences(nodes) {
      nodes.forEach(node => {
        this.patient.evidence = this.patient.evidence.filter(x => x.name !== node.name)
        this.nodes = this.nodes.filter(x => x.name !== node.name)
        this.patient.evidence.push(node)
      })
      this.calculate()
    },
    deleteEvidence(node) {
      this.patient.evidence = this.patient.evidence.filter(x => x.name !== node.name)
      this.nodes.push({name: node.name, options: node.options})
      this.calculate()
    },
    addTargets(nodes) {
      nodes.forEach(node => {
        this.patient.targets.push(node)
        this.nodes = this.nodes.filter(x => x.name !== node.name)
      })
      this.calculate()
    },
    deleteTarget(node) {
      this.patient.targets = this.patient.targets.filter(x => x.name !== node.name)
      this.nodes.push(node)
      this.calculate()
    },
    addGoals(nodes) {
      nodes.forEach(node => {
        this.patient.goals = this.patient.goals.filter(x => x.name !== node.name)
        this.nodes = this.nodes.filter(x => x.name !== node.name)
        this.patient.goals.push(node)
      })
      this.calculate()
    },
    deleteGoal(node) {
      this.patient.goals = this.patient.goals.filter(x => x.name !== node.name)
      this.nodes.push({name: node.name, options: node.options})
      this.calculate()
    },
    selectedOptionUpdated(option) {
      this.options.selectedOption = option
      if (option === []) this.explain.relevance = null
      else {
        this.calculateOption()
      }
    },
    exportCSV(name) {
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
      console.log(csv)

      const anchor = document.createElement('a');
      anchor.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
      anchor.target = '_blank';
      anchor.download = name + '.csv';
      anchor.click();
    }
  },
  created: async function () {
    await this.loadNodes()

    if (this.network === '0') {
      //add example nodes
      let CA125 = this.nodes.find(x => x.name === "CA125")
      CA125["selected"] = {"name": "lt_35"}
      this.addEvidences([CA125])
      this.addTargets([this.nodes.find(x => x.name === "Therapy")])
      let surv = this.nodes.find(x => x.name === "Survival1yr")
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

.box-stretched {
        height: 100%;
    }



#arrow {
  width: 100%;
  height: 30%;
}




</style>