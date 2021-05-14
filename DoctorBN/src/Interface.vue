<template>

  <Header @changePage="changePage()"/>
  <div class=" p-grid p-flex-column nested-grid">
    <div class="p-grid p-d-flex p-flex-nowrap">
      <div class="p-col-2">
        <NodeInput title = "Evidence" :nodes="nodes" @setNodes="evidenceUpdated($event)"/>
      </div>
      <div class="p-col-2">
        <Therapy :nodes="nodes" @update="targetsUpdated($event)" />
      </div>
      <div class="p-col-2">
        <NodeInput title = "Desired Outcomes" :nodes="nodes" @setNodes="goalsUpdated($event)"/>
      </div>
      <div class="p-col">
        <TherapyOptions :results="results"/>
      </div>
    </div>
    <div class="p-grid p-d-flex" style="height: 50%">

      <div class="p-col">
        <Network :target='target'/>
      </div>
      <div class="p-col-3">
        <Additional/>
      </div>
    </div>
  </div>
</template>

<script>
import Header from "./components/Header";
import NodeInput from "./components/NodeInput";
import Therapy from "./components/Therapy";
import Additional from "./components/additional";
import Network from "./components/Network";
import TherapyOptions from "@/components/TherapyOptions";

export default {
  name: "Interface",
  components: {
    Header,
    NodeInput,
    Therapy,
    Additional,
    Network,
    TherapyOptions
  },
  data() {
    return {
      targets: null,
      evidence: null,
      goals: null,
      nodes: null,
      results: null
    }
  },
  methods: {
    changePage() {
      this.$emit("changePage")
    },
    calculate: async function() {
      if (this.evidence != null && this.targets != null && this.goals != null) {
        console.log("doing calculation for:")
        console.log(this.targets)
        console.log(this.evidence)
        console.log(this.goals)

        let evidences = {}
        for (var ev in this.evidence) {
          evidences[ev] = this.evidence[ev].name;
        }
        let goals = {}
        for (var goal in this.goals) {
          goals[goal] = this.goals[goal].name;
        }

        const gResponse = await fetch("http://localhost:5000//calcTargetForGoals", {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            evidences: evidences,
            target: this.targets,
            goals: goals
          })
        });
        let nodeDict = await gResponse.json();
        console.log('results: ')
        console.log(nodeDict.results)
        this.results = nodeDict.results
      }
    },
    evidenceUpdated(evidence) {
      this.evidence = evidence
      this.calculate()
    },
    targetsUpdated(target) {
      this.targets = target
      this.calculate()
    },
    goalsUpdated(goals) {
      this.goals = goals
      this.calculate()
    }
  },
  created: async function(){
        const gResponse = await fetch("http://localhost:5000/cancernet");
        const nodeDict = await gResponse.json();
        let nodes = []
        for (var key in nodeDict) {
          let options = []
          nodeDict[key].forEach(value => {
            options.push({'name' : value})
          })
          nodes.push({'name': key, 'options' : options})
        }
        this.nodes = nodes
        console.log(nodes)
    }
}
</script>

<style scoped>

.p-grid {
  margin-top: 0px;
  margin-bottom: 10px
}

#arrow {
  width: 100%;
  height: 30%;
}

</style>