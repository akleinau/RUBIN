import {defineStore} from 'pinia';
import {NNode, NEvidence, NGoal, NTarget, Patient_type} from "./types/node_types.ts";
import {Explain_type} from "./types/explanation_types.ts";
import {Prediction_type} from "./types/prediction_types.ts";
import {Phase, PhaseGoal} from "./types/phase_types.ts";
import {CustomLabels, Label_type, Labelmap} from "./types/label_types.ts";

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
        } as Patient_type,

        //available options to treat the patient given the interventions
        predictions: {
            options: [],
            likelyResult: null,
            selectedOption: null,
        } as Prediction_type,

        //explaining calculations for the chosen option
        explain: {
            explanation: null,
            relevance: [],
            states: [],
        } as Explain_type,

        edges: [] as {source: string, target: string}[], //edges of the network
        network_translation: {
            original_labels: {} as Labelmap,
            custom_labels: {} as CustomLabels
        },

        labels: {
            nodes: {},
            states: {},
            evidence_groups: {}
        } as Label_type,

        configurations: [],
        compareConfig: null as null |{patient: Patient_type, explain: Explain_type, predictions: Prediction_type},

        optionsLoading: false as boolean,
        explanationLoading: false as boolean,

        description: "" as string,
        network: "" as string,
        localNet: null as null | {fileString: string, fileFormat: string, description: string},
        phases: [] as Phase[],
        evidenceGroupMap: null,
        currentPhase: null as Phase | null,
        language: "en" as string,
        tutorialStep: -1 as number,
        error: false as boolean,
        backgroundColor: "#372f5e" as string
    }),
    actions: {
        /**
         * gets called when all patient information is resetted
         *
         * @param {boolean} noPhase - true when the first phase should be selected, false when no phase should be selected
         * @returns {Promise<void>}
         */
        async reset(noPhase : boolean = false) {
            this.compareConfig = null
            this.patient.evidence.forEach(a => this.deleteEvidence(a))
            this.patient.name = ""
            this.predictions = {
                options: [],
                likelyResult: null,
                selectedOption: null,
            }

            //explaining calculations for the chosen option
            this.explain = {
                explanation: null,
                relevance: [], //{node_name, overall_relevance, relevancies[goal]}
                states: [],
            }

            if (noPhase || this.phases.length === 0) {
                this.currentPhase = null
                this.patient.goals.forEach(a => this.deleteGoal(a))
                this.patient.targets.forEach(a => this.deleteTarget(a))
            } else {
                this.currentPhase = this.phases[0]
                this.phase_change()
            }

            // eslint-disable-next-line
            umami.track('button-reset', {network: this.network} );


            await this.calculate()

        },
        /**
         * calculates data for prediction view: overall results & changes through therapy options
         *
         * @param {boolean} compare - true when the calculations should be done for the compare configuration
         * @returns {Promise<void>}
         */
        async calculate(compare : boolean = false) {
            let patient = this.patient
            let predictions = this.predictions
            let explain = this.explain
            if (compare && this.compareConfig) {
                patient = this.compareConfig.patient
                predictions = this.compareConfig.predictions
                explain = this.compareConfig.explain
            }


            if (patient.goals.length !== 0) {
                this.optionsLoading = true
                this.explanationLoading = true

                let evidences: any = {}
                for (const ev in patient.evidence) {
                    evidences[patient.evidence[ev].name] = patient.evidence[ev].selected.name;
                }

                //use current patient goals in both current config and compare config
                let goals : any = {}
                let goalDirections: any = {}
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
                    if (predictions.selectedOption !== null) {
                        let tmpOption = JSON.stringify(predictions.selectedOption.option)
                        let oldOption = predictions.options.find(a => JSON.stringify(a.option) ===
                            tmpOption)
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
        /**
         * calculate data for explanation view: explanations based on current option
         *
         * @param {Object} patient - patient information
         * @param {Object} predictions - prediction data
         * @param {Object} explain - explanation object used to save the results of the calculation
         * @returns {Promise<void>}
         */
        async calculateExplanations(patient: Patient_type, predictions: Prediction_type, explain: Explain_type) {
            this.explanationLoading = true

            let evidences : any = {}
            for (var ev in patient.evidence) {
                evidences[patient.evidence[ev].name] = patient.evidence[ev].selected.name;
            }

            let goals: any = {}
            let goalDirections: any = {}
            for (var goal in this.patient.goals) {
                if (!evidences[this.patient.goals[goal].name]) {
                    goals[this.patient.goals[goal].name] = this.patient.goals[goal].selected.name;
                    goalDirections[this.patient.goals[goal].name] = this.patient.goals[goal].direction
                }
            }
            let tmpoptions = null
                if (predictions.selectedOption) {
                    tmpoptions = predictions.selectedOption.option
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
                        options: tmpoptions,
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
                        options: tmpoptions,
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
        /**
         * load network nodes and configuration at the beginning, from server or local file
         *
         * @param {boolean} noPhase - true when the first phase should be selected, false when no phase should be selected
         * @returns {Promise<void>}
         */
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
            let nodes : NNode[] = []
            this.labels.states = {}
            for (var key in network.states) {
                let options: {"name": string}[] = []
                this.labels.states[key] = {}
                network.states[key].forEach((option_name: string) => {
                    this.labels.states[key][option_name] = option_name
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
            this.network_translation.original_labels = JSON.parse(JSON.stringify(network.labels))
            console.log(this.network_translation)
            this.labels.nodes = network.labels

            this.evidenceGroupMap = {}
            this.labels.evidence_groups = {}
            this.backgroundColor = "#372f5e"

            if (customization !== undefined && customization !== null) {
                this.phases = network.customization.phases
                if (!noPhase) {
                    this.currentPhase = this.phases[0]
                    this.phase_change()
                }

                if (network.customization.evidence_groups) {
                    network.customization.evidence_groups.forEach((g: any, i: number) => {
                        g.variables.forEach(v => {
                            this.evidenceGroupMap[v] = g.name
                        })
                        this.labels.evidence_groups[g.name] = {"num": i, "labels": g.labels}

                    })
                }

                if (network.customization.translation) {
                    this.network_translation.custom_labels = network.customization.translation
                }

                if (network.customization.backgroundColor) {
                    this.backgroundColor = network.customization.backgroundColor
                }

            } else {
                this.phases = []
                nodes.forEach(node => {
                    this.evidenceGroupMap[node.name] = ""
                })
                this.network_translation.custom_labels = {}
            }

            this.updateLabels()

            this.tutorialStep = 0
            await this.calculate()
        },

        /**
         * updates node and node state labels based on selected language
         */
        updateLabels() {

            for (const name in this.labels.nodes) {
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
                this.labels.nodes[name] = label
            }

            for (const name in this.labels.states) {
                for (const option_name in this.labels.states[name]) {

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
                    this.labels.states[name][option_name] = label
                }
            }

        },
        /**
         * adds nodes as patient evidence and deletes them from remaining node list
         *
         * @param {Object[]} nodes - List of nodes that should be added
         */
        addEvidences(nodes: NEvidence[]) {
            nodes.forEach((node: NEvidence) => {
                this.patient.evidence = this.patient.evidence.filter((x: NEvidence) => x.name !== node.name)
                this.patient.nodes = this.patient.nodes.filter(x => x.name !== node.name)
                this.patient.evidence.push(node)
            })
        },
        /**
         * deletes nodes from patient evidence and adds them to remaining node list
         *
         * @param {Object} node - the node that should be deleted
         */
        deleteEvidence(node: NEvidence) {
            this.patient.evidence = this.patient.evidence.filter((x: NEvidence) => x.name !== node.name)
            this.patient.nodes.push({name: node.name, options: node.options})
        },
        /**
         * adds nodes as patient target and deletes them from remaining node list
         *
         * @param {Object[]} nodes - List of nodes that should be added
         */
        addTargets(nodes: NTarget[]) {
            nodes.forEach((node: NTarget) => {
                this.patient.targets.push(node)
                this.patient.nodes = this.patient.nodes.filter(x => x.name !== node.name)
            })
        },
        /**
         * deletes nodes from patient target and adds them to remaining node list
         *
         * @param {Object} node - the node that should be deleted
         */
        deleteTarget(node: NTarget) {
            this.patient.targets = this.patient.targets.filter((x: NTarget) => x.name !== node.name)
            this.patient.nodes.push(node)
        },
        /**
         * adds nodes as patient goals and deletes them from remaining node list
         *
         * @param {Object[]} nodes - List of nodes that should be added
         */
        addGoals(nodes: NGoal[]) {
            nodes.forEach(node => {
                this.patient.goals = this.patient.goals.filter((x: NGoal) => x.name !== node.name)
                this.patient.nodes = this.patient.nodes.filter((x: NNode) => x.name !== node.name)
                this.patient.goals.push(node)
            })
        },
        /**
         * deletes nodes from patient targets and adds them to remaining node list
         *
         * @param {Object} node - the node that should be deleted
         */
        deleteGoal(node: NGoal) {
            this.patient.goals = this.patient.goals.filter((x: NGoal) => x.name !== node.name)
            this.patient.nodes.push({name: node.name, options: node.options})
        },
        /**
         * creates csv file content for download of patient configuration
         *
         * @returns {string}
         */
        createCSVcontent() {
            var csv = "Type; Variable; Option; Direction"
            this.patient.evidence.forEach((ev : NEvidence) => {
                csv += "\nevidence; " + ev.name + "; " + ev.selected.name
            })
            this.patient.targets.forEach((ev: NTarget) => {
                csv += "\ntarget; " + ev.name
            })
            this.patient.goals.forEach((ev : NGoal) => {
                csv += "\ngoal; " + ev.name + "; " + ev.selected.name + "; " + ev.direction
            })
            return csv
        },
        /**
         * checks if phase was changed and triggers recalculation of data accordingly
         */
        phase_change() {
            if (this.currentPhase == null) {
                return
            }
            let reload = false //if recalculation has to happen

            //updates targets
            if (this.differentLists(this.patient.targets.map((a: NTarget) => a.name), this.currentPhase.sets.target)) {
                this.patient.targets.forEach(a => this.deleteTarget(a))
                let currTargets = this.currentPhase.sets.target
                this.addTargets(this.patient.nodes.filter((a: NNode) => currTargets.includes(a.name)))
                reload = true
            }

            //updates goals
            if (this.differentLists(this.patient.goals.map(a => a.name + a.selected.name + a.direction),
                this.currentPhase.sets.goal.map((a: PhaseGoal) => a.name + a.option + a.direction))) {
                this.patient.goals.forEach(a => this.deleteGoal(a))

                let goalList: NGoal[] = []
                this.currentPhase.sets.goal.forEach((a: PhaseGoal) => {
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

            // triggers recalculation
            if (reload) {
                this.calculate()
                if (this.compareConfig) {
                    this.calculate(true)
                }
            }
        },
        /**
         * returns true when two lists contain different items
         *
         * @param a
         * @param b
         * @returns {boolean}
         */
        differentLists(a: any[], b: any[]) {
            let missing = (a.filter(x => !b.includes(x))).length
            missing += (b.filter(x => !a.includes(x))).length
            return missing > 0
        },
    }
})