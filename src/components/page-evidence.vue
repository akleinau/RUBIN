<template>
  <Card style="position:relative" class="Evidence ml-1">
    <template #title>
      {{ $t("Evidence") }}
      <Button icon="pi pi-question" class="p-button-outlined p-button-secondary p-button-rounded p-button-raised help"
              @click="$refs.op.toggle($event)"/>
      <OverlayPanel ref="op" style="width:500px">
        {{ $t("EvidenceHelp") }}
      </OverlayPanel>
    </template>
    <template #content>
      <ScrollPanel style="height:100%">

        <!-- Help box more evidence -->
        <div v-if="notEnoughEvidenceEndorisk()">
          <i class="pi pi-exclamation-circle"/>
          Add at least the preoperative tumor grade, three biomarkers and one clinical variable for more accurate
          information!
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
              {{ Store.labels[slotProps.data.name] }}
            </template>
          </Column>

          <!--compare column -->
          <Column class="optionCol" header="compare" v-if="Store.compareConfig">
            <template #body="slotProps">
              <div v-if="slotProps.data.selectedCompare === ''"></div>
              <div v-else> {{ Store.option_labels[slotProps.data.name][slotProps.data.selectedCompare] }}</div>
            </template>
          </Column>

          <Column field="value" :header="Store.compareConfig ? 'current' : ''" class="optionCol">
            <template #body="slotProps">
              <div class="flex flex-row flex-nowrap flex-shrink">
                <Dropdown v-model="slotProps.data.selected" :options="slotProps.data.options"
                          :optionLabel="get_option_label"
                          placeholder="" @change="onNodeChange(slotProps.data)"
                          class="flex p-0 m-0 flex-shrink"
                          :inputClass="{ highlightCompare: isDifferentState(slotProps.data) }">
                </Dropdown>
                <Button v-if="slotProps.data.selected" icon="pi pi-times"
                        class="flex p-button-rounded p-button-secondary p-button-text p-button-sm p-0 m-0"
                        @click="deleteNode(slotProps.data)"/>
              </div>
            </template>
          </Column>
        </DataTable>

        <!--    input dialog  -->
        <Dialog header="  " v-model:visible="overlay" style=" background:white" :modal="true"
                :closable="false" class="w-11 h-11">
          <template #header>
            <div class="flex justify-content-end w-full">
              <Button class="mr-2" label="add" icon="pi pi-check" @click="addNodesFromOverlay()"/>
              <Button class="p-button-secondary mr-2" label="cancel" icon="pi pi-times" @click="cancelOverlay"/>
              <Button class="p-button-secondary" label="clear evidence" icon="pi pi-trash" @click="clearEvidence"/>
            </div>
          </template>
          <br>
          <DataTable :value="overlayNodes" rowGroupMode="subheader" groupRowsBy="group" class="p-datatable-sm"
                     sortMode="single" sortField="group" :sortOrder="1"
                     responsiveLayout="scroll"
                     v-model:filters="filters" filterDisplay="menu" data-key="name">
            <template #header>
              <div class="flex justify-content-between">
                <span class="p-input-icon-right" style="width:100%">
                    <InputText style="width:100%" v-model="filters['name'].value" placeholder="Search"/>
                  <i class="pi pi-search"/>
                </span>
              </div>
            </template>
            <template #groupheader="slotProps">
              <br>
              <h3> {{ slotProps.data.group.substr(2) }} </h3>
            </template>
            <Column field="name" :header="$t('Node')">
              <template #body="slotProps">
                {{ Store.labels[slotProps.data.name] }}
              </template>
            </Column>
            <Column field="group" header="group">
            </Column>
            <Column field="options">
              <template #body="slotProps">
                <ToggleButton class="m-2" v-for="option in slotProps.data.options" :key="option"
                              v-model="option.checked" @change="onOverlayOptionChange(slotProps, option)"
                              :onLabel="Store.option_labels[slotProps.data.name][option.name]" onIcon="pi pi-check"
                              :offLabel="Store.option_labels[slotProps.data.name][option.name]" offIcon="pi pi-plus">
                </ToggleButton>

              </template>
            </Column>
          </DataTable>
        </Dialog>

        <!-- Buttons -->
        <div>
          <Button class="addButton" @click="overlay = true"
                  :label="$t('addEvidence')"></Button>
        </div>
      </ScrollPanel>
    </template>

  </Card>
</template>

<script>
import {useStore} from '@/store'
import {FilterMatchMode} from "primevue/api";

export default {
  name: "evidence-input",
  setup() {
    const Store = useStore()
    return {Store}
  },
  data() {
    return {
      overlay: false,
      selected: null,
      filters: {
        'name': {value: null, matchMode: FilterMatchMode.STARTS_WITH}
      },
      nodesToAdd: [],
      multiSortMeta: [
        {field: 'group', order: 1},
        {field: 'name', order: 2}
      ]
    }
  },
  computed: {
    //adds 'checked' property to every option of every node of the overlay
    overlayNodes: function () {
      let nodes = this.Store.patient.nodes

      return nodes.map(node => {
            return {
              name: node.name,
              options: node.options.map(option => {
                return {
                  name: option.name,
                  checked: this.nodesToAdd.find(n => n.name === node.name && n.selected.name === option.name) != null,
                  node: node.name
                }
              }),
              group: this.Store.evidenceGroupMap === null ? "" : this.Store.evidenceGroupMap[node.name]
            }
          }
      )
    },
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
              group: this.Store.evidenceGroupMap === null ? "" : this.Store.evidenceGroupMap[n.name]
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
    onOverlayOptionChange(slotProps, option) {
      //deselect this and other options of the node
      this.nodesToAdd = this.nodesToAdd.filter(n => n.name !== slotProps.data.name)
      this.filters.name.value = null

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
          group: this.Store.evidenceGroupMap === null ? "" : this.Store.evidenceGroupMap[slotProps.data.name]
        }
        this.nodesToAdd.push(item);
      }
    },
    addNodesFromOverlay() {
      this.addNodes(this.nodesToAdd)
      this.nodesToAdd = []
      this.overlay = false
    },
    deleteNode(node) {
      this.Store.deleteEvidence(node)
      this.Store.calculate()
    },
    deleteNodeFromOverlay(node) {
      this.nodesToAdd = this.nodesToAdd.filter(x => x !== node)
    },
    onNodeChange(node) {
      this.addNodes([node])
    },
    addNodes(nodes) {
      this.Store.addEvidences(nodes)
      this.Store.calculate()
    },
    cancelOverlay() {
      this.nodesToAdd = []
      this.overlay = false
    },
    clearEvidence() {
      this.cancelOverlay()
      this.Store.patient.evidence.forEach(ev => {
        this.Store.deleteEvidence(ev)
      })

    },
    isDifferentState(item) {
      if (item.selectedCompare === '') return false
      return item.selected.name !== item.selectedCompare
    },
    get_option_label(option) {
      return this.Store.option_labels[option.node][option.name]
    },
    //directly coded in here, should be in the customization file
    notEnoughEvidenceEndorisk() {
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