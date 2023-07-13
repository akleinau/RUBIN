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
                <div v-if="notEnoughEvidenceEndorisk()">
                    <i class="pi pi-exclamation-circle"/>
                    {{ $t("notEnoughEvidenceEndorisk") }}
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
                        <div class="flex justify-content-end w-full bg-white">
                            <Button class="p-button-secondary mr-2 p-button-text p-button-rounded" icon="pi pi-times"
                                    @click="cancelOverlay"/>
                        </div>
                    </template>
                    <DataTable :value="overlayNodes" rowGroupMode="subheader" groupRowsBy="group" class="p-datatable-sm"
                               sortMode="single" sortField="group" :sortOrder="1"
                               responsiveLayout="scroll" id="evidenceOverlayTable"
                               v-model:filters="filters" filterDisplay="menu" data-key="name">
                        <template #header>
                            <div class="flex justify-content-between">
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
                                <ToggleButton class="m-2" v-for="option in slotProps.data.options" :key="option"
                                              v-model="option.checked"
                                              @change="onOverlayOptionChange(slotProps, option)"
                                              :onLabel="Store.labels.states[slotProps.data.name][option.name]"
                                              onIcon="pi pi-check"
                                              :offLabel="Store.labels.states[slotProps.data.name][option.name]"
                                              offIcon="pi pi-plus">
                                </ToggleButton>

                            </template>
                        </Column>
                    </DataTable>
                    <template #footer>
                        <div class="flex justify-content-center w-full bg-white pt-3 border-top-3 border-gray-300">
                            <Button class="mr-4 w-4" :label="this.$t('add')" icon="pi pi-check-square"
                                    id="addOverlayEvidence"
                                    @click="addNodesFromOverlay()"/>
                            <Button class="p-button-secondary mr-2" :label="this.$t('Cancel')" icon="pi pi-times"
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

<script>
import {useStore} from '@/store'
import {FilterMatchMode} from "primevue/api";

export default {
    name: "page-evidence",
    setup() {
        const Store = useStore()
        return {Store}
    },
    data() {
        return {
            overlay: false,
            selected: null,
            filters: {
                'label': {value: null, matchMode: FilterMatchMode.CONTAINS}
            },
            nodesToAdd: [],
            multiSortMeta: [
                {field: 'group', order: 1},
                {field: 'label', order: 2},
                {field: 'name', order: 3}
            ],
            clearEvidenceDialog: false
        }
    },
    computed: {
        /**
         * calculates overlay nodes adding 'checked' property to every option of every remaining patient node
         *
         * @returns {{name: *, options: *, group: string|*}[]}
         */
        overlayNodes: function () {
            let nodes = this.Store.patient.nodes

            return nodes.map(node => {
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
                        group: this.Store.evidenceGroupMap === null ? "" : this.get_group_label(node.name)
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
            let table = JSON.parse(JSON.stringify(this.Store.patient.evidence))

            if (this.Store.compareConfig) {
                table.forEach(n => n.selectedCompare = '-')
                let compareEvidence = this.Store.compareConfig.patient.evidence

                compareEvidence.forEach(n => {
                    let foundNode = table.find(a => a.name === n.name)
                    if (foundNode == null) {
                        table.push({
                            name: n.name,
                            selected: '',
                            selectedCompare: n.selected.name,
                            options: n.options,
                            group: this.Store.evidenceGroupMap === null ? "" : this.get_group_label(n.name)
                        })
                    } else {
                        foundNode.selectedCompare = n.selected.name
                    }
                })
            } else {
                table.forEach(n => n.selectedCompare = '')
            }

            return table
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
        onOverlayOptionChange(slotProps, option) {
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
                    group: this.Store.evidenceGroupMap === null ? "" : this.get_group_label(slotProps.data.name)
                }
                this.nodesToAdd.push(item);
            }
            if (this.Store.tutorialStep === 2) {
                this.Store.tutorialStep = 3
            }
        },
        /**
         * Adds selected nodes from overlay to patient evidence
         */
        addNodesFromOverlay() {
            this.addNodes(this.nodesToAdd)
            this.nodesToAdd = []
            this.overlay = false
            if (this.Store.tutorialStep === 3) {
                this.Store.tutorialStep = 4
            }
        },
        /**
         * deletes evidence node
         *
         * @param node
         */
        deleteNode(node) {
            this.Store.deleteEvidence(node)
            this.Store.calculate()
        },
        /**
         * removes node from the list of nodes that will be added to evidence at the end of using the overlay
         *
         * @param node
         */
        deleteNodeFromOverlay(node) {
            this.nodesToAdd = this.nodesToAdd.filter(x => x !== node)
        },
        /**
         * Gets called when for an evidence item a different option is selected via dropdown menu
         *
         * @param node
         */
        onNodeChange(node) {
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
        addNodes(nodes) {
            this.Store.addEvidences(nodes)
            this.Store.calculate()
        },
        /**
         * Gets called when the overlay is closed
         */
        cancelOverlay() {
            this.nodesToAdd = []
            this.overlay = false
            this.filters.label.value = null
        },
        /**
         * deletes all evidence
         */
        clearEvidence() {
            this.cancelOverlay()
            this.Store.patient.evidence.forEach(ev => {
                this.Store.deleteEvidence(ev)
            })
            document.activeElement.blur()
            this.clearEvidenceDialog = false
            this.Store.calculate()

        },
        /**
         * checks if a node has the same state selected in current and compare configuration
         *
         * @param item
         * @returns {boolean}
         */
        isDifferentState(item) {
            if (item.selectedCompare === '') return false
            return item.selected.name !== item.selectedCompare
        },
        /**
         * returns the option label
         *
         * @param option
         * @returns {*}
         */
        get_option_label(option) {
            return this.Store.labels.states[option.node][option.name]
        },
        /**
         * returns the group label
         *
         * @param name
         * @returns {string}
         */
        get_group_label(name) {
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
            if (!this.Store.patient.evidence.find(n => n.name === 'PrimaryTumor')) {
                notEnoughInformation = true
            }

            //3 biomarkers
            let biomarkers = 0
            if (this.Store.patient.evidence.find(n => n.name === 'PR')) {
                biomarkers += 1
            }
            if (this.Store.patient.evidence.find(n => n.name === 'ER')) {
                biomarkers += 1
            }
            if (this.Store.patient.evidence.find(n => n.name === 'L1CAM')) {
                biomarkers += 1
            }
            if (this.Store.patient.evidence.find(n => n.name === 'p53')) {
                biomarkers += 1
            }
            if (biomarkers < 3) {
                notEnoughInformation = true
            }

            //one clinical variable
            if (!this.Store.patient.evidence.find(n => ['CA125', 'CTMRI', 'Platelets', 'Cytology'].includes(n.name))) {
                notEnoughInformation = true
            }

            return notEnoughInformation
        }
    }
}
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