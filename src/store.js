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
        selectedConfig: null, //{name, config: {patient, explain, options}}

        optionsLoading: false,
        explanationLoading: false,

        description: "",
        network: "",
        localNet: "",
        phases: [],
        evidenceGroupMap: null,
        currentPhase: null,
        showTutorial: false
    }),
    actions: {
        async reset(noPhase = false) {
            this.patient.targets = []
            this.patient.evidence = []
            this.patient.goals = []
            this.patient.nodes = []
            this.patient.name = ""

            this.options.options = null
            this.options.selectedOption = null
            this.options.likelyResult = null

            this.explain.relevance = null
            this.explain.states = null
            this.explain.explanation = null

            this.currentPhase = null

            await this.loadNodes(noPhase)

        },
        //calculate overall results & changes through therapy options
        async calculate(compare = false) {
            let patient = this.patient
            let options = this.options
            let explain = this.explain
            if (compare) {
                patient = this.selectedConfig.config.patient
                options = this.selectedConfig.config.options
                explain = this.selectedConfig.config.explain
            }


            if (patient.goals.length !== 0) {
                this.optionsLoading = true
                this.explanationLoading = true

                let evidences = {}
                for (var ev in patient.evidence) {
                    evidences[patient.evidence[ev].name] = this.patient.evidence[ev].selected.name;
                }

                //use current patient goals in both current config and compare config
                let goals = {}
                for (var goal in this.patient.goals) {
                    goals[this.patient.goals[goal].name] = this.patient.goals[goal].selected.name;
                }

                let targets = []
                for (const target in patient.targets) {
                    targets.push(patient.targets[target].name)
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
                if (patient.targets.length !== 0) {
                    options.options = nodeDict.optionResults
                } else {
                    options.options = []
                }
                options.likelyResult = [{
                    option: {}, value: nodeDict.likelyResults.value,
                    goalValues: nodeDict.likelyResults.goalValues
                }]
                options.options.unshift(options.likelyResult[0])
                if (!compare) { //don't overwrite the saved selected option when comparing
                    options.selectedOption = options.likelyResult[0]
                }
                else {
                    options.selectedOption = options.options.find(a => JSON.stringify(a.option) ===
                        JSON.stringify(options.selectedOption.option))
                                        console.log(options.options)
                }

                this.optionsLoading = false
                await this.calculateExplanations(patient, options, explain)
            }
        },
        //calculate explanations based on current option
        async calculateExplanations(patient, options, explain) {
            this.explanationLoading = true

            let evidences = {}
            for (var ev in this.patient.evidence) {
                evidences[patient.evidence[ev].name] = patient.evidence[ev].selected.name;
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
                        options: options.selectedOption.option,
                        goals: goals
                    })
                });
            } else {
                gResponse = await fetch("https://doctorbn-backend.herokuapp.com/calcOptions", {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify({
                        network: this.network,
                        evidences: evidences,
                        options: options.selectedOption.option,
                        goals: goals
                    })
                });
            }

            let nodeDict = await gResponse.json();
            explain.relevance = nodeDict.relevance
            explain.states = nodeDict.nodes
            explain.explanation = nodeDict.explanation
            this.explanationLoading = false
        },
        //load network at the beginning from server or local file
        async loadNodes(noPhase = false) {
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
            } else {
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
                if (!noPhase) {
                    this.currentPhase = this.phases[0]
                    this.phase_change()
                }

                if (network.customization.evidence_groups) {
                    this.evidenceGroupMap = {}
                    network.customization.evidence_groups.forEach((g, i) => {
                        g.variables.forEach(v => {
                            this.evidenceGroupMap[v] = i + " " + g.name
                        })
                    })
                }
            }
            await this.calculate()
        },
        addEvidences(nodes) {
            nodes.forEach(node => {
                this.patient.evidence = this.patient.evidence.filter(x => x.name !== node.name)
                this.patient.nodes = this.patient.nodes.filter(x => x.name !== node.name)
                this.patient.evidence.push(node)
            })
        },
        deleteEvidence(node) {
            this.patient.evidence = this.patient.evidence.filter(x => x.name !== node.name)
            this.patient.nodes.push({name: node.name, options: node.options})
        },
        addTargets(nodes) {
            nodes.forEach(node => {
                this.patient.targets.push(node)
                this.patient.nodes = this.patient.nodes.filter(x => x.name !== node.name)
            })
        },
        deleteTarget(node) {
            this.patient.targets = this.patient.targets.filter(x => x.name !== node.name)
            this.patient.nodes.push(node)
        },
        addGoals(nodes) {
            nodes.forEach(node => {
                this.patient.goals = this.patient.goals.filter(x => x.name !== node.name)
                this.patient.nodes = this.patient.nodes.filter(x => x.name !== node.name)
                this.patient.goals.push(node)
            })
        },
        deleteGoal(node) {
            this.patient.goals = this.patient.goals.filter(x => x.name !== node.name)
            this.patient.nodes.push({name: node.name, options: node.options})
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
            let reload = false
            if (this.differentLists(this.patient.targets.map(a => a.name), this.currentPhase.sets.target)) {
                this.patient.targets.forEach(a => this.deleteTarget(a))
                this.addTargets(this.patient.nodes.filter(a => this.currentPhase.sets.target.includes(a.name)))
                reload = true
            }
            if (this.differentLists(this.patient.goals.map(a => a.name + a.selected.name),
                this.currentPhase.sets.goal.map(a => a.name + a.option))) {
                this.patient.goals.forEach(a => this.deleteGoal(a))

                let goalList = []
                this.currentPhase.sets.goal.forEach(a => {
                    let fullnode = this.patient.nodes.find(b => b.name === a.name)
                    goalList.push({"name": a.name, "selected": {"name": a.option}, "options": fullnode.options})
                })
                this.addGoals(goalList)
                reload = true
            }
            if (reload) {
                this.calculate()
                if (this.selectedConfig) {
                    this.calculate(true)
                }
            }
        },
        differentLists(a, b) {
            let missing = (a.filter(x => !b.includes(x))).length
            missing += (b.filter(x => !a.includes(x))).length
            return missing > 0
        }
    }
})