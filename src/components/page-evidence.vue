<template>
    <Card style="position:relative" class="Evidence">
        <template #title>
            {{ $t("Evidence") }}
            <Button icon="pi pi-question"
                    class="p-button-outlined p-button-secondary p-button-rounded p-button-raised help"
                    @click="$refs.op.toggle($event)"/>
            <OverlayPanel ref="op" style="width:400px">
                {{ $t("EvidenceHelp") }}
            </OverlayPanel>
        </template>
        <template #content>
            <ScrollPanel style="height:100%">

                <!-- Help box more evidence -->
                <div v-if="!presetRequirementsSatisfied.satisfied">
                    <i class="pi pi-exclamation-circle"/>
                    {{ $t("RequirementsAccurateInformation") }}
                  <div>
                    <ul class="mt-1" style="text-align: center;">
                        <li v-for="(requirement, index) in presetRequirementsSatisfied.requirements" :key="index"
                            :style="requirement.satisfied ? 'color: darkgrey' : 'color: crimson'"
                            style="display: block; text-align: center">
                          <span v-if="!requirement.satisfied">
                            {{ getDescriptionInCorrectLanguage(requirement.text) }}
                          </span>
                        </li>
                    </ul>
                  </div>


                </div>

                <!-- Evidence Table -->
                <DataTable class="p-datatable-sm" :class="{NoHeader: !Store.compareConfig}" id="table" :value="table"
                           rowGroupMode="subheader" groupRowsBy="group" responsiveLayout="scroll"
                           sortMode="multiple" :multiSortMeta="multiSortMeta">
                    <template #groupheader="slotProps">
                        <br>
                        <b> {{ slotProps.data.group.substr(2) }} </b>
                    </template>

                    <Column field="group"/>
                    <Column field="name" style="padding: 0; border: 0; width:50%" frozen>
                        <template #body="slotProps">
                            {{ Store.labels.nodes[slotProps.data.name] }}
                        </template>
                    </Column>

                    <!--compare column -->
                    <Column class="optionCol" :header="$t('compare')" v-if="Store.compareConfig">
                        <template #body="slotProps">
                            <div v-if="slotProps.data.selectedCompare === ''"></div>
                            <div v-else> {{
                                Store.labels.states[slotProps.data.name][slotProps.data.selectedCompare]
                                }}
                            </div>
                        </template>
                    </Column>

                    <Column field="value" :header="Store.compareConfig ? $t('current') : ''" class="optionCol">
                        <template #body="slotProps">
                            <div class="flex flex-row flex-nowrap flex-shrink">
                                <Dropdown v-model="slotProps.data.selected" :options="slotProps.data.options"
                                          :optionLabel="get_option_label"
                                          placeholder="" @change="onNodeChange(slotProps.data)"
                                          class="flex p-0 m-0 flex-shrink w-full" showClear
                                          :style="'max-width:' + maxWidthDropdown"
                                          :inputClass="{ highlightCompare: isDifferentState(slotProps.data) }">
                                </Dropdown>
                            </div>
                        </template>
                    </Column>
                </DataTable>

                <!--    input dialog  -->
                <Dialog header="  " v-model:visible="overlay" style="background:white; width: 80%;  height:90%" :modal="true"
                        :closable="false">
                    <template #header>
                        <div class="flex justify-content-end w-full bg-white" id="evidenceOverlayTable">
                            <Button class="p-button-secondary mr-2 p-button-text p-button-rounded" icon="pi pi-times"
                                    @click="cancelOverlay"/>
                        </div>
                    </template>
                    <DataTable :value="overlayNodes" rowGroupMode="subheader" groupRowsBy="group" class="p-datatable-sm"
                               sortMode="single" sortField="group" :sortOrder="1"
                               responsiveLayout="scroll"
                               v-model:filters="filters" filterDisplay="menu" data-key="name">
                        <template #header>
                            <div v-if="Store.tutorialStep === 12" class="flex justify-content-between">
                            <span class="p-input-icon-right" style="width:100%">
                                <InputText style="width:100%" v-model="filters['label'].value" :placeholder="$t('search') + '...'"/>
                              <i class="pi pi-search"/>
                            </span>
                            </div>
                        </template>
                        <template #groupheader="slotProps">
                            <br>
                            <h3> {{ slotProps.data.group.substr(2) }} </h3>
                        </template>
                        <Column field="label" :header="$t('Node')">
                        </Column>
                        <Column field="group" header="group">
                        </Column>
                        <Column field="options">
                            <template #body="slotProps">
                                <div v-tooltip.left="isDisabled(slotProps.data.group_name) ? $t('EvidenceDisabled') : ''">
                                    <ToggleButton class="m-2 " v-for="option in slotProps.data.options" :key="option"
                                                  v-model="option.checked" :disabled="isDisabled(slotProps.data.group_name)"
                                                  @change="onOverlayOptionChange(slotProps, option)"
                                                  :onLabel="Store.labels.states[slotProps.data.name][option.name]"
                                                  onIcon="pi pi-check"
                                                  :offLabel="Store.labels.states[slotProps.data.name][option.name]"
                                                  offIcon="pi pi-plus">
                                    </ToggleButton>
                                </div>

                            </template>
                        </Column>
                    </DataTable>
                    <template #footer>
                        <div class="flex justify-content-center w-full bg-white pt-3 border-top-3 border-gray-300">
                            <Button class="mr-4 w-4 bg-teal-600 border-teal-600" :label="$t('add')" icon="pi pi-check-square"
                                    id="addOverlayEvidence" :disabled="Store.tutorialStep === 2 && Store.strictPhaseMode && !presetRequirementsSatisfied.satisfied"
                                    @click="addNodesFromOverlay()"/>
                            <Button class="p-button-secondary mr-2" :label="$t('Cancel')" icon="pi pi-times"
                                    @click="cancelOverlay"/>
                        </div>
                    </template>
                </Dialog>

                <!-- Buttons -->
                <div>
                    <Button class="addButton" @click="addButtonClicked" id="addButton"
                            :label="$t('addEvidence')"></Button>
                    <Button class="p-button-text addButton mt-1 text-black-alpha-70" @click="clearEvidenceDialog = true"
                            :label="$t('DeleteAllEvidence')"></Button>
                    <Dialog v-model:visible="clearEvidenceDialog">
                        <div class="m-2">{{ $t("DeleteAllEvidenceDialog") }} <br></div>
                        <div class="flex justify-content-end">
                            <Button class="m-2 p-button-text" @click="clearEvidenceDialog = false"> {{ $t("Cancel") }}
                            </Button>
                            <Button class="m-2" @click="clearEvidence()"> {{ $t("proceed") }}</Button>
                            <Button class="m-2" v-if="Store.compareConfig"
                                    @click="Store.compareConfig = null; clearEvidence()">
                                {{ $t("stopComparing") }} & {{ $t("proceed") }}
                            </Button>
                        </div>

                    </Dialog>
                </div>
            </ScrollPanel>
        </template>

    </Card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {useStore} from '../store.ts';
import {usePatientStore} from "../stores/patient_store.ts";
import {FilterMatchMode} from "primevue/api";
import {NEvidence, NNode, SOption} from "../types/node_types.ts";
import {Requirement} from "../types/phase_types.ts";

export default defineComponent({
    name: "page-evidence",
    setup() {
        const Store = useStore()
        const PatientStore = usePatientStore()
        return {Store, PatientStore}
    },
    data() {
        return {
            overlay: false,
            selected: null,
            filters: {
                'label': {value: null, matchMode: FilterMatchMode.CONTAINS}
            },
            nodesToAdd: [] as NEvidence[],
            multiSortMeta: [
                {field: 'group', order: 1},
                {field: 'label', order: 2},
                {field: 'name', order: 3}
            ],
            clearEvidenceDialog: false,
            presetRequirementsSatisfied: {satisfied: false, requirements: []}
        }
    },
    computed: {
        /**
         * calculates overlay nodes adding 'checked' property to every option of every remaining patient node
         *
         * @returns {{name: *, options: *, group: string|*}[]}
         */
        overlayNodes: function () {
            let nodes = this.PatientStore.nodes

            return nodes.map((node: NNode) => {
                    return {
                        name: node.name,
                        label: this.Store.labels.nodes[node.name],
                        options: node.options.map(option => {
                            return {
                                name: option.name,
                                checked: this.nodesToAdd.find(n => n.name === node.name && n.selected.name === option.name) != null,
                                node: node.name
                            }
                        }),
                        group: this.Store.evidenceGroupMap === null ? "" : this.get_group_label(node.name),
                        group_name: this.Store.evidenceGroupMap === null ? "" : this.get_group_name(node.name)
                    }
                }
            )
        },
        /**
         * calculates displayed table by combining evidence of current and (optional) compared patient
         *
         * @returns {any}
         */
        table: function () {
            let table = JSON.parse(JSON.stringify(this.PatientStore.evidence))

            if (this.Store.compareConfig) {
                table.forEach((n: NEvidence) => n.selectedCompare = '-')
                let compareEvidence = this.Store.compareConfig.patient.evidence

                compareEvidence.forEach((n: NEvidence) => {
                    let foundNode = table.find((a: NEvidence) => a.name === n.name)
                    if (foundNode == null) {
                        table.push({
                            name: n.name,
                            selected: '',
                            selectedCompare: n.selected.name,
                            options: n.options,
                            group: this.Store.evidenceGroupMap === null ? "" : this.get_group_label(n.name),
                            group_name: this.Store.evidenceGroupMap === null ? "" : this.get_group_name(n.name)
                        })
                    } else {
                        foundNode.selectedCompare = n.selected.name
                    }
                })
            } else {
                table.forEach((n: NEvidence) => n.selectedCompare = '')
            }

            return table
        },
        maxWidthDropdown: function() {
            return this.Store.compareConfig ? '150px' : '200px'
        },
        currentPhase: function() {
            return this.Store.currentPhase
        }

    },
    watch: {
        currentPhase: function () {
            this.checkRequirements()
        }
    },
    methods: {
      /**
       * Gets called when user clicks on the "add evidence" button.
       */
      addButtonClicked() {
        this.overlay = true
        if (this.Store.tutorialStep === 1) {
          this.Store.tutorialStep = 2
        }
      },

      /**
       * Gets called when user selects/ deselects something in the overlay
       *
       * @param slotProps - the changed node
       * @param option - the selected/ deselected option
       */
      async onOverlayOptionChange(slotProps, option) {
        //deselect this and other options of the node
        this.nodesToAdd = this.nodesToAdd.filter(n => n.name !== slotProps.data.name)

        //convert node in format used for selected nodes and add it to 'shopping list'
        if (option.checked) {
          let item = {
            name: slotProps.data.name,
            selected: {name: option.name, node: slotProps.data.name},
            options: slotProps.data.options.map(option => {
              return {
                name: option.name,
                node: slotProps.data.name,
              }
            }),
            group: this.Store.evidenceGroupMap === null ? "" : this.get_group_label(slotProps.data.name),
            group_name: this.Store.evidenceGroupMap === null ? "" : this.get_group_name(slotProps.data.name)
          }
          this.nodesToAdd.push(item);
        }

        //update the tutorial
        if (this.Store.tutorialStep === 2) {

          if (this.Store.strictPhaseMode) {
            this.checkRequirements()
            if (this.Store.phaseRequirementsSatisfied) {
              this.Store.tutorialStep = 3
            }
          }

          else {
            this.Store.tutorialStep = 3
          }

        }

        if (this.Store.tutorialStep === 3) {
          if (this.Store.strictPhaseMode) {
            this.checkRequirements()
            if (!this.Store.phaseRequirementsSatisfied) {
              this.Store.tutorialStep = 2
            }
          }
        }

      },
      /**
       * Adds selected nodes from overlay to patient evidence
       */
      addNodesFromOverlay() {
        this.checkRequirements()
        this.addNodes(this.nodesToAdd)
        this.nodesToAdd = []
        this.overlay = false
        if (this.Store.tutorialStep === 3) {
          this.Store.tutorialStep = 4
        }

        // eslint-disable-next-line
        umami.track('button-addEvidence', {network: this.Store.network});
      },
      /**
       * deletes evidence node
       *
       * @param node
       */
      deleteNode(node: NEvidence) {
        if (this.PatientStore.evidence.find((n: NEvidence) => n.name === node.name) != null) {
          this.PatientStore.deleteEvidence(node)
          this.checkRequirements()
          this.Store.calculate()
        }
      },
      /**
       * removes node from the list of nodes that will be added to evidence at the end of using the overlay
       *
       * @param node
       */
      deleteNodeFromOverlay(node: NEvidence) {
        this.nodesToAdd = this.nodesToAdd.filter(x => x !== node)
      },
      /**
       * Gets called when for an evidence item a different option is selected via dropdown menu
       *
       * @param node
       */
      onNodeChange(node: NEvidence) {
        if (node.selected === null) {
          this.deleteNode(node)
        } else {
          this.addNodes([node])
        }
      },
      /**
       * adds nodes to patient evidence and calls recalculation
       *
       * @param nodes
       */
      addNodes(nodes: NEvidence[]) {
        this.PatientStore.addEvidences(nodes)
        this.Store.calculate()
      },
      /**
       * Gets called when the overlay is closed
       */
      cancelOverlay() {
        this.nodesToAdd = []
        this.overlay = false
        this.filters.label.value = null

        if (this.Store.tutorialStep === 2) {
          this.Store.tutorialStep = 1
        }

      },
      /**
       * deletes all evidence
       */
      clearEvidence() {
        this.cancelOverlay()
        this.PatientStore.evidence.forEach((ev: NEvidence) => {
          this.PatientStore.deleteEvidence(ev)
        })
        document.activeElement.blur()
        this.clearEvidenceDialog = false

        // eslint-disable-next-line
        umami.track('button-clearEvidence', {network: this.Store.network});

        this.Store.calculate()

      },
      /**
       * checks if a node has the same state selected in current and compare configuration
       *
       * @param item
       * @returns {boolean}
       */
      isDifferentState(item: NEvidence) {
        if (item.selectedCompare === '') return false
        return item.selected.name !== item.selectedCompare
      },
      /**
       * returns the option label
       *
       * @param option
       * @returns {*}
       */
      get_option_label(option: SOption) {
        return this.Store.labels.states[option.node][option.name]
      },
      /**
       * returns the group label
       *
       * @param name
       * @returns {string}
       */
      get_group_label(name: string): string {
        let id = this.Store.evidenceGroupMap[name]
        if (id === "") return ""
        let label_element = this.Store.labels.evidence_groups[id]

        //find label based on language
        let label = id
        if (label_element.labels[this.Store.language]) {
          label = label_element.labels[this.Store.language]
        } else if (label_element.labels["standard"]) {
          label = label_element.labels["standard"]
        }

        return label_element.num + " " + label
      },
      /**
       * returns the group name
       *
       * @param name
       * @returns {string}
       */
      get_group_name(name: string): string {
        return this.Store.evidenceGroupMap[name]
      },
      /**
       * returns if the evidence item should be disabled
       */
      isDisabled(group: string): boolean {
        if (this.Store.currentPhase !== null && this.Store.currentPhase.sets.evidence_groups !== null) {
          return !this.Store.currentPhase.sets.evidence_groups.includes(group);
        } else {
          return false
        }
      },


      //directly coded in here, should be in the customization file
      /**
       * returns if for the endorisk model enough evidence is added
       *
       * @returns {boolean}
       */
      notEnoughEvidenceEndorisk() {
        if (this.Store.network !== "endometrial cancer") return false
        let notEnoughInformation = false
        //tumor grade
        if (!this.PatientStore.evidence.find((n: NEvidence) => n.name === 'PrimaryTumor')) {
          notEnoughInformation = true
        }

        //3 biomarkers
        let biomarkers = 0
        if (this.PatientStore.evidence.find((n: NEvidence) => n.name === 'PR')) {
          biomarkers += 1
        }
        if (this.PatientStore.evidence.find((n: NEvidence) => n.name === 'ER')) {
          biomarkers += 1
        }
        if (this.PatientStore.evidence.find((n: NEvidence) => n.name === 'L1CAM')) {
          biomarkers += 1
        }
        if (this.PatientStore.evidence.find((n: NEvidence) => n.name === 'p53')) {
          biomarkers += 1
        }
        if (biomarkers < 3) {
          notEnoughInformation = true
        }

        //one clinical variable
        if (!this.PatientStore.evidence.find((n: NEvidence) => ['CA125', 'CTMRI', 'Platelets', 'Cytology'].includes(n.name))) {
          notEnoughInformation = true
        }

        return notEnoughInformation
      },
      checkRequirements() {

        //Create a set containing both the evidence and selected nodes in overlay
        let items = [] as NEvidence[]
        this.PatientStore.evidence.forEach((n: NEvidence) => items.push(n))
        this.nodesToAdd.forEach((n: NEvidence) => items.push(n))

        // get current phase
        if (this.Store.currentPhase === null || this.Store.currentPhase.sets.requirements === undefined) {
          this.presetRequirementsSatisfied = {satisfied: true, requirements: []}
          return
        }

        let RequirementFulfillment = {satisfied: true, requirements: []}
        //check if all requirements are satisfied
        for (const requirement of this.Store.currentPhase.sets.requirements) {
          let satisfied = true
          let counter = 0

          if (requirement.type == "items") {
            for (const item of requirement.members) {
              if (items.find((n: NEvidence) => n.name === item)) {
                counter += 1
              }
            }
          } else if (requirement.type == "groups") {
            for (const group of requirement.members) {
              if (items.find((n: NEvidence) => n.group_name === group)) {
                counter += 1
              }
            }
          }

          if (counter < requirement.nr) {
            satisfied = false
          }

          RequirementFulfillment.requirements.push({satisfied: satisfied, text: requirement.description})

        }

        RequirementFulfillment.satisfied = RequirementFulfillment.requirements.every(r => r.satisfied)

        this.presetRequirementsSatisfied = RequirementFulfillment
        this.Store.phaseRequirementsSatisfied = RequirementFulfillment.satisfied
        this.Store.phaseRequirementsString = RequirementFulfillment.requirements
            .filter(r => !r.satisfied)
            .map(r => this.getDescriptionInCorrectLanguage(r.text))
            .join(", ")

      },
      getDescriptionInCorrectLanguage(description: any) {
          if (description === null) return ""
          if (description[this.Store.language]) {
            return description[this.Store.language]
          } else if (description["standard"]) {
            return description["standard"]
          } else {
            return description
          }
        }

    }
})
</script>

<style scoped>
.p-card {
    height: 100% !important;
}

.help {
    position: absolute;
    right: 5%
}

#evidence {
    background-color: white;
}

.addButton {
    width: 100%;
    position: relative;
}

#table {
    padding: 0;
    margin: 0
}


.p-datatable-thead {
    padding: 0;
    border: 0;
}

.NoHeader ::v-deep(.p-datatable-thead) {
    display: None !important
}

::v-deep(.p-dropdown-label) {
    padding-right: 0;
    margin: 0;
}

::v-deep(.highlightCompare) {
    color: darkviolet !important;
}

</style>