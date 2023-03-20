import {defineStore} from 'pinia';

const address = "https://doctorbn-backend.herokuapp.com/"
//const address = "http://127.0.0.1:5000/"

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
        predictions: {
            options: null,
            likelyResult: null,
            selectedOption: null,
        },

        //explaining calculations for the chosen option
        explain: {
            explanation: null,
            relevance: null, //{node_name, overall_relevance, relevancies[goal]}
            states: null,
        },

        edges: [], //edges of the network
        network_translation: {
            original_labels: null,
            custom_labels: null
        },
        labels: null,
        option_labels: null,
        labels_evidence_groups: null,

        configurations: [],
        compareConfig: null, //{patient, explain, predictions}

        optionsLoading: false,
        explanationLoading: false,

        description: "",
        network: "",
        localNet: "",
        phases: [],
        evidenceGroupMap: null,
        currentPhase: null,
        language: "en",
        tutorialStep: 0,
        error: false
    }),
    actions: {
        async reset(noPhase = false) {
            this.compareConfig = null
            this.patient.evidence.forEach(a => this.deleteEvidence(a))
            this.patient.name = ""

            if (noPhase || this.phases.length === 0) {
                this.currentPhase = null
                this.patient.goals.forEach(a => this.deleteGoal(a))
                this.patient.targets.forEach(a => this.deleteTarget(a))
            } else {
                this.currentPhase = this.phases[0]
                this.phase_change()
            }


            await this.calculate()

        },
        //calculate overall results & changes through therapy options
        async calculate(compare = false) {
            let patient = this.patient
            let predictions = this.predictions
            let explain = this.explain
            if (compare) {
                patient = this.compareConfig.patient
                predictions = this.compareConfig.predictions
                explain = this.compareConfig.explain
            }


            if (patient.goals.length !== 0) {
                this.optionsLoading = true
                this.explanationLoading = true

                let evidences = {}
                for (const ev in patient.evidence) {
                    evidences[patient.evidence[ev].name] = patient.evidence[ev].selected.name;
                }

                //use current patient goals in both current config and compare config
                let goals = {}
                let goalDirections = {}
                for (const goal in this.patient.goals) {
                    if (!evidences[this.patient.goals[goal].name]) {
                        goals[this.patient.goals[goal].name] = this.patient.goals[goal].selected.name;
                        goalDirections[this.patient.goals[goal].name] = this.patient.goals[goal].direction
                    }
                }

                let targets = []
                for (const target in patient.targets) {
                    if (!evidences[patient.targets[target].name]) {
                        targets.push(patient.targets[target].name)
                    }
                }
                let gResponse = null
                if (this.localNet) {
                    gResponse = await fetch(address + "calcTargetForGoals", {
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
                            goals: goals,
                            goalDirections: goalDirections
                        })
                    });
                } else {
                    gResponse = await fetch(address + "calcTargetForGoals", {
                        method: 'POST',
                        headers: {
                            'content-type': 'application/json'
                        },
                        body: JSON.stringify({
                            network: this.network,
                            evidences: evidences,
                            target: targets,
                            goals: goals,
                            goalDirections: goalDirections
                        })
                    });
                }
                //catch errors
                console.log(gResponse)
                if (!gResponse.ok) {
                    console.log("error")
                    this.optionsLoading = false
                    const message = `An error has occured: ${gResponse.status}`;
                    throw new Error(message);
                }

                this.error = false
                //catch json parse error
                let nodeDict = await gResponse.json().catch((error) => {
                    console.log("error: " + error)
                    this.error = true

                });
                if (!this.error) {
                    if (patient.targets.length !== 0) {
                        predictions.options = nodeDict.optionResults
                    } else {
                        predictions.options = []
                    }
                    predictions.likelyResult = [{
                        option: {}, value: nodeDict.likelyResults.value,
                        goalValues: nodeDict.likelyResults.goalValues
                    }]
                    predictions.options.unshift(predictions.likelyResult[0])

                    //don't overwrite the saved selected option
                    if (predictions.selectedOption) {
                        let oldOption = predictions.options.find(a => JSON.stringify(a.option) ===
                            JSON.stringify(predictions.selectedOption.option))
                        if (oldOption) {
                            predictions.selectedOption = oldOption
                        } else {
                            predictions.selectedOption = predictions.likelyResult[0]
                        }
                    } else {
                        predictions.selectedOption = predictions.likelyResult[0]
                    }

                    this.optionsLoading = false
                    await this.calculateExplanations(patient, predictions, explain)
                }
            }
        },
        //calculate explanations based on current option
        async calculateExplanations(patient, predictions, explain) {
            this.explanationLoading = true

            let evidences = {}
            for (var ev in patient.evidence) {
                evidences[patient.evidence[ev].name] = patient.evidence[ev].selected.name;
            }

            let goals = {}
            let goalDirections = {}
            for (var goal in this.patient.goals) {
                if (!evidences[this.patient.goals[goal].name]) {
                    goals[this.patient.goals[goal].name] = this.patient.goals[goal].selected.name;
                    goalDirections[this.patient.goals[goal].name] = this.patient.goals[goal].direction
                }
            }
            let gResponse = null
            if (this.localNet) {
                gResponse = await fetch(address + "calcOptions", {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify({
                        network: this.network,
                        fileString: this.localNet.fileString,
                        fileFormat: this.localNet.fileFormat,
                        evidences: evidences,
                        options: predictions.selectedOption.option,
                        goals: goals,
                        goalDirections: goalDirections
                    })
                });
            } else {
                gResponse = await fetch(address + "calcOptions", {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify({
                        network: this.network,
                        evidences: evidences,
                        options: predictions.selectedOption.option,
                        goals: goals,
                        goalDirections: goalDirections
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
                gResponse = await fetch(address + "getLocalNetwork", {
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
                gResponse = await fetch(address + "getNetwork?network=" + this.network);
            }
            const network = await gResponse.json();
            let customization = network.customization
            let nodes = []
            this.option_labels = {}
            for (var key in network.states) {
                let options = []
                this.option_labels[key] = {}
                network.states[key].forEach(option_name => {
                    this.option_labels[key][option_name] = option_name
                    options.push({'name': option_name})
                })
                nodes.push({'name': key, 'options': options})
            }
            this.patient.nodes = nodes

            this.edges = []
            network.edges.forEach(edge => {
                this.edges.push({"source": edge[0], "target": edge[1]})
            })

            this.description = network.description
            this.network_translation.original_labels = network.labels
            this.labels = network.labels

            this.evidenceGroupMap = {}
            this.labels_evidence_groups = {}

            if (customization !== undefined) {
                this.phases = network.customization.phases
                if (!noPhase) {
                    this.currentPhase = this.phases[0]
                    this.phase_change()
                }

                if (network.customization.evidence_groups) {
                    network.customization.evidence_groups.forEach((g, i) => {
                        g.variables.forEach(v => {
                            this.evidenceGroupMap[v] = g.name
                        })
                        this.labels_evidence_groups[g.name] = {"num": i, "labels": g.labels}

                    })
                }

                if (network.customization.translation) {
                    this.network_translation.custom_labels = network.customization.translation
                }
            } else {
                this.phases = []
                nodes.forEach(node => {
                    this.evidenceGroupMap[node.name] = ""
                })
                this.network_translation.custom_labels = {}
            }

            this.updateLabels()

            await this.calculate()
        },
        updateLabels() {

            for (const name in this.labels) {
                //prio 3: original name
                let label = this.network_translation.original_labels[name]

                if (this.network_translation.custom_labels) {
                    //prio 2: standard name
                    let standard = this.network_translation.custom_labels["standard"]
                    if (standard && standard[name]) {
                        label = standard[name]
                    }

                    //prio 1: language-specific name
                    let language = this.network_translation.custom_labels[this.language]
                    if (language && language[name]) {
                        label = language[name]
                    }

                }
                this.labels[name] = label
            }

            for (const name in this.option_labels) {
                for (const option_name in this.option_labels[name]) {

                    //prio 3: original name
                    let label = option_name

                    if (this.network_translation.custom_labels) {
                        //prio 2: standard name
                        let standard = this.network_translation.custom_labels["standard"]
                        if (standard && standard[name + " - " + option_name]) {
                            label = standard[name + " - " + option_name]
                        }

                        //prio 1: language-specific name
                        let language = this.network_translation.custom_labels[this.language]
                        if (language && language[name + " - " + option_name]) {
                            label = language[name + " - " + option_name]
                        }

                    }
                    this.option_labels[name][option_name] = label
                }
            }
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
            var csv = "Type; Variable; Option; Direction"
            this.patient.evidence.forEach(ev => {
                csv += "\nevidence; " + ev.name + "; " + ev.selected.name
            })
            this.patient.targets.forEach(ev => {
                csv += "\ntarget; " + ev.name
            })
            this.patient.goals.forEach(ev => {
                csv += "\ngoal; " + ev.name + "; " + ev.selected.name + "; " + ev.direction
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
            if (this.differentLists(this.patient.goals.map(a => a.name + a.selected.name + a.direction),
                this.currentPhase.sets.goal.map(a => a.name + a.option + a.direction))) {
                this.patient.goals.forEach(a => this.deleteGoal(a))

                let goalList = []
                this.currentPhase.sets.goal.forEach(a => {
                    let fullnode = this.patient.nodes.find(b => b.name === a.name)
                    if (fullnode) {
                        let selectedOption = fullnode.options.find(o => o.name === a.option)
                        if (selectedOption) {
                            goalList.push({
                                "name": a.name, "selected": selectedOption, "options": fullnode.options,
                                "direction": a.direction
                            })
                        }
                    }
                })
                this.addGoals(goalList)
                reload = true
            }
            if (reload) {
                this.calculate()
                if (this.compareConfig) {
                    this.calculate(true)
                }
            }
        },
        differentLists(a, b) {
            let missing = (a.filter(x => !b.includes(x))).length
            missing += (b.filter(x => !a.includes(x))).length
            return missing > 0
        },
    }
})