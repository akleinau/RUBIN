import {defineStore} from 'pinia';

export const useStore = defineStore('store', {
  state: () => ({
    //data that is specific to the patient
    patient: {
        targets: [],
        evidence: [],
        goals: [],
        nodes: [], //nodes of the network that are neither evidence, goals, nor targets
        name: "",
      },

    //available options to treat the patient given the interventions
    options: {
      options: null,
      likelyResult: null,
      selectedOption: null,
    },

    //explaining calculations for the chosen option
    explain: {
      explanation: null,
      relevance: null,
      states: null,
    },

    edges: [], //edges of the network
    labels: null,

    configurations: [],
    selectedConfig: null,

    newGoals: null, //helper property to let the data tables update TODO: replace

    optionsLoading: false,
    explanationLoading: false,

    description: "",
    network: "",
    localNet: "",
    phases: [],
    currentPhase: null
  }),
  actions: {
    async reset() {
      this.patient.targets = []
      this.patient.evidence = []
      this.patient.goals = []
      this.patient.nodes = []
      this.patient.name = ""

      this.options.options = null
      this.options.selectedOption = null
      this.options.likelyResult = null
      this.newGoals = null

      this.explain.relevance = null
      this.explain.states = null
      this.explain.explanation = null

      await this.loadNodes()
    },
    async calculate() {
       if (this.patient.evidence.length !== 0 && this.patient.goals.length !== 0) {
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
         for (const target in this.patient.targets) {
           targets.push(this.patient.targets[target].name)
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
         } else {
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
         if (this.patient.targets.length !== 0) {
           this.options.options = nodeDict.optionResults
         } else {
           this.options.options = []
         }
         this.options.likelyResult = [{
           option: {}, value: nodeDict.likelyResults.value,
           goalValues: nodeDict.likelyResults.goalValues
         }]
         this.options.options.unshift(this.options.likelyResult[0])
         this.options.selectedOption = this.options.likelyResult[0]

         this.newGoals = goals
         this.optionsLoading = false
         await this.calculateOption()
       }
    },
    async calculateOption() {
      this.explanationLoading = true

      let evidences = {}
      for (var ev in this.patient.evidence) {
        evidences[this.patient.evidence[ev].name] = this.patient.evidence[ev].selected.name;
      }

      let goals = {}
      for (var goal in this.patient.goals) {
        goals[this.patient.goals[goal].name] = this.patient.goals[goal].selected.name;
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
          options: this.options.selectedOption.option,
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
          options: this.options.selectedOption.option,
          goals: goals
        })
      });
      }

      let nodeDict = await gResponse.json();
      this.explain.relevance = nodeDict.relevance
      this.newGoals = goals
      this.explain.states = nodeDict.nodes
      this.explain.explanation = nodeDict.explanation
      this.explanationLoading = false
    },
    async loadNodes() {
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
      this.patient.nodes = nodes

      this.edges = []
      network.edges.forEach(edge => {
        this.edges.push({"source": edge[0], "target": edge[1]})
      })

      this.description = network.description
      this.labels = network.labels
      let customization = network.customization
      if (customization != null) {
        this.phases = network.customization.phases
        this.currentPhase = this.phases[0]
        this.phase_change()
      }
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
    phase_change() {
      this.patient.targets.forEach(a => this.deleteTarget(a))
      this.patient.goals.forEach(a => this.deleteGoal(a))
      this.addTargets(this.patient.nodes.filter(a => this.currentPhase.sets.target.includes(a.name)))
      this.currentPhase.sets.goal.forEach(a => {
        let fullnode = this.patient.nodes.find(b => b.name === a.name)
        this.addGoals([{"name": a.name, "selected": {"name":a.option}, "options": fullnode.options}])
      })
    }
  }
})