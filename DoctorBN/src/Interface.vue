<template>

  <Header @changePage="changePage()" @reset="reset()" @exportCSV="exportCSV()"/>
  <div class=" p-grid  nested-grid">
    <div class="p-grid p-col-3 p-flex-column">
      <div class="p-col">
        <NodeInput title="Evidence" :nodes="nodes" :selection="evidence"
                   @addNodes="addEvidences($event)" @deleteNode="deleteEvidence($event)"/>
      </div>
      <div class="p-col ">
        <Therapy :nodes="nodes" :selection="targets"
                 @addNodes="addTargets($event)" @deleteNode="deleteTarget($event)"/>
      </div>
      <div class="p-col ">
        <NodeInput title="Desired Outcomes" :nodes="nodes" :selection="goals"
                   @addNodes="addGoals($event)" @deleteNode="deleteGoal($event)"/>
      </div>

    </div>
    <div class="p-grid p-col-9 p-flex-column ">
            <div class="p-col">
        <TherapyOptions :results="options" :goals="newGoals" :goalResults="goalResults"
                        @update="selectedOptionUpdated($event)"/>
      </div>
      <div class="p-col">
        <Network :relevance = "relevance" :goals="newGoals" :edges="edges" :nodes="states" :explanation="explanation"/>
      </div>
   <!--   <div class="p-col-3">
        <Additional/>
      </div> -->
    </div>
  </div>
</template>

<script>
import Header from "./components/Header";
import NodeInput from "./components/NodeInput";
import Therapy from "./components/Therapy";
//import Additional from "./components/additional";
import Network from "./components/Network";
import TherapyOptions from "@/components/TherapyOptions";

export default {
  name: "Interface",
  components: {
    Header,
    NodeInput,
    Therapy,
   // Additional,
    Network,
    TherapyOptions
  },
  props: [
      "network"
  ],
  data() {
    return {
      targets: [],
      evidence: [],
      goals: [],
      newGoals: null,
      nodes: [],
      options: null,
      goalResults: null,
      selectedOption: null,
      relevance: null,
      edges: null,
      states: null,
      explanation: null
    }
  },
  methods: {
    changePage() {
      this.$emit("changePage")
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
      console.log("edges: " )
      console.log(edges)
    },
    reset() {
      this.targets= []
      this.evidence= []
      this.goals= []
      this.newGoals= null
      this.nodes= []
      this.options= null
      this.goalResults= null
      this.selectedOption= null
      this.relevance= null
      this.edges= null
      this.states= null
      this.explanation= null

      this.loadNodes()
    },
    calculate: async function () {
      if (this.evidence.length !== 0 && this.targets.length !== 0 && this.goals.length !== 0) {
        console.log("doing calculation for:")

        let evidences = {}
        for (var ev in this.evidence) {
          evidences[this.evidence[ev].name] = this.evidence[ev].selected.name;
        }
        let goals = {}
        for (var goal in this.goals) {
          goals[this.goals[goal].name] = this.goals[goal].selected.name;
        }

        let targets = []
        for (var target in this.targets) {
          targets.push(this.targets[target].name)
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
        this.options = nodeDict.optionResults
        console.log(nodeDict.likelyResults)
        this.goalResults = nodeDict.likelyResults

        this.newGoals = goals

      }
    },
    calculateOption: async function () {
      console.log("calculating relevance for:")
      console.log(this.selectedOption)

      let evidences = {}
      for (var ev in this.evidence) {
        evidences[this.evidence[ev].name] = this.evidence[ev].selected.name;
      }
      console.log(evidences)

      let goals = {}
      for (var goal in this.goals) {
        goals[this.goals[goal].name] = this.goals[goal].selected.name;
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
          options: this.selectedOption.option,
          goals: goals
        })
      });
      let nodeDict = await gResponse.json();
      console.log('relevance: ')
      this.relevance = nodeDict.relevance
      console.log(this.relevance)
      this.newGoals = goals
      this.states = nodeDict.nodes
      console.log(this.states)
      this.explanation = nodeDict.explanation
      console.log(this.explanation)
    },
    addEvidences(nodes) {
      nodes.forEach(node => {
        this.evidence.push(node)
        this.nodes = this.nodes.filter(x => x.name !== node.name)
      })
      this.calculate()
    },
    deleteEvidence(node) {
      this.evidence = this.evidence.filter(x => x.name !== node.name)
      this.nodes.push({name: node.name, options: node.options})
      this.calculate()
    },
    addTargets(nodes) {
      nodes.forEach(node => {
        this.targets.push(node)
        this.nodes = this.nodes.filter(x => x.name !== node.name)
      })
      this.calculate()
    },
    deleteTarget(node) {
      this.targets = this.targets.filter(x => x.name !== node.name)
      this.nodes.push(node)
      this.calculate()
    },
    addGoals(nodes) {
      nodes.forEach(node => {
        this.goals.push(node)
        this.nodes = this.nodes.filter(x => x.name !== node.name)
      })
      this.calculate()
    },
    deleteGoal(node) {
      this.goals = this.goals.filter(x => x.name !== node.name)
      this.nodes.push({name: node.name, options: node.options})
      this.calculate()
    },
    selectedOptionUpdated(option) {
      this.selectedOption = option
      if (option === []) this.relevance = null
      else {
        this.calculateOption()
      }
    },
    exportCSV() {
      var csv = ''
      this.evidence.forEach(ev => {
        csv += "evidence; " + ev.name + "; " + ev.selected.name + "\n"
      })
      this.targets.forEach(ev => {
        csv += "target; " + ev.name + "\n"
      })
      this.goals.forEach(ev => {
        csv += "goal; " + ev.name + "; " + ev.selected.name + "\n"
      })
      console.log(csv)

      const anchor = document.createElement('a');
      anchor.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
      anchor.target = '_blank';
      anchor.download = 'patient.csv';
      anchor.click();
    }
  },
  created: async function () {
    await this.loadNodes()

    //add example nodes
    let CA125 = this.nodes.find(x => x.name === "CA125")
    CA125["selected"] = {"name":"lt_35"}
    this.addEvidences([CA125])
    this.addTargets([this.nodes.find(x => x.name === "Therapy")])
    let surv = this.nodes.find(x => x.name === "Survival1yr")
    surv["selected"] = {"name": "yes"}
    this.addGoals([surv])

  }
}
</script>

<style scoped>

.p-grid {
  margin-top: 0px;
  margin-bottom: 10px
}

.box-stretched {
        height: 100%;
    }

#arrow {
  width: 100%;
  height: 30%;
}

</style>