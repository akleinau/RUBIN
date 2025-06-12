import {defineStore} from "pinia";
import {NEvidence, NGoal, NNode, NTarget, Patient_type} from "../types/node_types.ts";

export const usePatientStore = defineStore('patientStore', {
    state: () => ({
        //data that is specific to the patient

        targets: [] as NTarget[],
        evidence: [] as NEvidence[],
        goals: [] as NGoal[],
        nodes: [] as NNode[], //nodes of the network that are neither evidence, goals, nor targets
        name: "" as string,

    }),
    actions: {
        /**
         * adds nodes as patient evidence and deletes them from remaining node list
         *
         * @param {Object[]} nodes - List of nodes that should be added
         */
        addEvidences(nodes: NEvidence[]) {
            nodes.forEach((node: NEvidence) => {
                this.evidence = this.evidence.filter((x: NEvidence) => x.name !== node.name)
                this.nodes = this.nodes.filter(x => x.name !== node.name)
                this.evidence.push(node)
            })
        },
        /**
         * deletes nodes from patient evidence and adds them to remaining node list
         *
         * @param {Object} node - the node that should be deleted
         */
        deleteEvidence(node: NEvidence) {
            this.evidence = this.evidence.filter((x: NEvidence) => x.name !== node.name)
            this.nodes.push({name: node.name, options: node.options})
        },
        /**
         * adds nodes as patient target and deletes them from remaining node list
         *
         * @param {Object[]} nodes - List of nodes that should be added
         */
        addTargets(nodes: NTarget[]) {
            nodes.forEach((node: NTarget) => {
                this.targets.push(node)
                this.nodes = this.nodes.filter(x => x.name !== node.name)
            })
        },
        /**
         * deletes nodes from patient target and adds them to remaining node list
         *
         * @param {Object} node - the node that should be deleted
         */
        deleteTarget(node: NTarget) {
            this.targets = this.targets.filter((x: NTarget) => x.name !== node.name)
            this.nodes.push(node)
        },
        /**
         * adds nodes as patient goals and deletes them from remaining node list
         *
         * @param {Object[]} nodes - List of nodes that should be added
         */
        addGoals(nodes: NGoal[]) {
            nodes.forEach(node => {
                this.goals = this.goals.filter((x: NGoal) => x.name !== node.name)
                this.nodes = this.nodes.filter((x: NNode) => x.name !== node.name)
                this.goals.push(node)
            })
        },
        /**
         * deletes nodes from patient targets and adds them to remaining node list
         *
         * @param {Object} node - the node that should be deleted
         */
        deleteGoal(node: NGoal) {
            this.goals = this.goals.filter((x: NGoal) => x.name !== node.name)
            this.nodes.push({name: node.name, options: node.options})
        },
        /**
         * creates csv file content for download of patient configuration
         *
         * @returns {string}
         */
        createCSVcontent() {
            var csv = "Type; Variable; Option; Direction"
            this.evidence.forEach((ev : NEvidence) => {
                csv += "\nevidence; " + ev.name + "; " + ev.selected.name
            })
            this.targets.forEach((ev: NTarget) => {
                csv += "\ntarget; " + ev.name
            })
            this.goals.forEach((ev : NGoal) => {
                csv += "\ngoal; " + ev.name + "; " + ev.selected.name + "; " + ev.direction
            })
            return csv
        },
        /**
         * creates a patient object that can be saved for comparison
         *
         * @returns {Patient_type}
         */
        generate_patient() : Patient_type {
            return {
                targets: this.targets,
                evidence: this.evidence,
                goals: this.goals,
                nodes: this.nodes,
                name: this.name
            };
        }

    }

})