<template>
  <DataTable id="table" :value="table" class="NoHeader p-datatable-sm"
             responsiveLayout="scroll" >
    <Column field="name" style="padding: 0; border: 0;">
      <template #body="slotProps">
        {{ Store.labels.nodes[slotProps.data.name] }}
      </template>
    </Column>
    <Column field="value" class="optionCol">
      <template #body="slotProps">
        <Dropdown v-model="slotProps.data.selected" :options="slotProps.data.options"
                  :optionLabel="get_option_label"  show-clear
                  placeholder="enter goal" @change="onNodeChange(slotProps.data)"
                  class="p-0 m-0 w-full">
        </Dropdown>
      </template>
    </Column>
     <Column field="direction">
      <template #body="slotProps">
        <Dropdown v-model="slotProps.data.direction" :options="directionOptions"
                  optionLabel="label" optionValue="name" optionKey="name"
                  @change="onNodeChange(slotProps.data)"
                  class="p-0 m-0 w-10rem">
        </Dropdown>
      </template>
    </Column>
  </DataTable>
  <!--    input dialog  -->
  <Dialog header="  " v-model:visible="overlay" style="width: 80%; height: 90%; background:white" :modal="true"
          :closable="false">
    <template #header>
      <div class="flex justify-content-end w-full">
        <Button class="mr-2" :label="$t('add')" icon="pi pi-check" @click="addNodesFromOverlay()"/>
        <Button class="p-button-secondary" :label="$t('Cancel')" icon="pi pi-times" @click="cancelOverlay"/>
      </div>
    </template>
    <DataTable :value="overlayNodes" class="p-datatable-sm" responsiveLayout="scroll"
               v-model:filters="filters" filterDisplay="menu" data-key="name">
      <template #header>
        <div class="flex justify-content-between">
                <span class="p-input-icon-right" style="width:100%">
                    <InputText style="width:100%" v-model="filters['label'].value" :placeholder="$t('search') + '...'"/>
                  <i class="pi pi-search"/>
                </span>
        </div>
      </template>
      <Column field="label" :header="$t('Node')">
      </Column>
      <Column field="options">
        <template #body="slotProps">
          <ToggleButton class="m-2" v-for="option in slotProps.data.options" :key="option"
                        v-model="option.checked" @change="onOverlayOptionChange(slotProps, option)"
                        :onLabel="Store.labels.states[slotProps.data.name][option.name]" onIcon="pi pi-check"
                        :offLabel="Store.labels.states[slotProps.data.name][option.name]" offIcon="pi pi-plus">
          </ToggleButton>

        </template>
      </Column>
      <Column field="direction" header="">
        <template #body="slotProps">
          <SelectButton class="m-2" :options="directionOptions" optionLabel="label" optionValue="name"
                        v-model="slotProps.data.direction" v-if="nodesToAdd.find(a => a.name === slotProps.data.name)"
                        @change="onOverlayDirectionChange(slotProps)">
          </SelectButton>
        </template>
      </Column>
    </DataTable>
  </Dialog>

  <!-- Buttons -->
  <div>
    <Button class="addButton p-button-secondary" @click="overlay = true"
            :label="$t('addOutcome')"></Button>
  </div>


</template>


<script lang="ts">
import { defineComponent } from 'vue';
import {FilterMatchMode} from 'primevue/api';
import {useStore} from "../../store";
import {usePatientStore} from "../../stores/patient_store.ts";
import {NGoal, NNode, SOption} from "../../types/node_types.ts";

export default defineComponent ({
  name: "goal-input",
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
      nodesToAdd: [] as NGoal[],
      directionOptions: [
        {name: "max", label: this.$t("max")},
        {name: "min", label: this.$t("min")}
      ]
    }
  },
  computed: {
      /**
       * calculates data of displayed table of current goals
       *
       * @returns {any}
       */
    table: function () {
      return this.Store.patient.goals.map((node: NGoal) => {
        return {
          name: node.name,
          selected: {name: node.selected.name, node: node.name},
          options:
              node.options.map(option => {
                return {
                  name: option.name,
                  node: node.name
                }
              }),
          direction: node.direction
        }
      })
    },

    /**
     * calculates data for overlay table, adding 'checked' property to every option of every node
     *
     * @returns {Object[]}
     */
    overlayNodes: function () {
      let nodes: NNode[] = this.Store.patient.nodes
      if (this.Store.currentPhase !== null) {
        let currentPhase = this.Store.currentPhase
        nodes = nodes.filter((x: NNode) => currentPhase.sets.goal.map(a => a.name).includes(x.name))

      }

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
              direction: this.getDirection(node)
            }
          }
      )
    }
  },
  methods: {
    /**
     * returns direction of a node of the overlay, if that node is supposed to be added as goal
     *
     * @param node
     * @returns string
     */
    getDirection(node: NNode): string {
      let listNode = this.nodesToAdd.find((n: NGoal) => n.name === node.name)
      if (listNode) {
        return listNode.direction
      }
      return ""
    },

    /**
     * Called when the user clicks on a node of the overlay
     *
     * @param slotProps
     * @param option
     */
    onOverlayOptionChange(slotProps: any, option: any) {
      let node = slotProps.data as NNode
      //deselect this and other options of the node
      this.nodesToAdd = this.nodesToAdd.filter((n: NGoal) => n.name !== slotProps.data.name)

      //convert node in format used for selected nodes and add it to 'shopping list'
      if (option.checked) {
        let item: NGoal = {
          name: node.name,
          selected: {name: option.name},
          options: slotProps.data.options.map((option:any) => {
            return {
              name: option.name,
              node: node.name
            }
          }),
          direction: "max"
        }
        this.nodesToAdd.push(item);
      }
    },

    /**
     * changes direction of a node when it is changed in the overlay
     *
     * @param slotProps
     */
    onOverlayDirectionChange(slotProps: any) {
      let node = slotProps.data as NGoal
      let equivalent_node = this.nodesToAdd.find((a: NGoal) => a.name === node.name)
      if (equivalent_node) {
       equivalent_node.direction = node.direction
      }
    },

    /**
     * adds selected nodes from overlay as goals
     */
    addNodesFromOverlay() {
      this.addNodes(this.nodesToAdd)
      this.nodesToAdd = []
      this.overlay = false
    },
    /**
     * deletes goal
     *
     * @param node
     */
    deleteNode(node: NGoal) {
      this.PatientStore.deleteGoal(node)
      this.Store.calculate()
      if (this.Store.compareConfig) {
        this.Store.calculate(true)
      }
    },
    /**
     * deselects node from overlay
     *
     * @param node
     */
    deleteNodeFromOverlay(node: NGoal) {
      this.nodesToAdd = this.nodesToAdd.filter((x: NGoal) => x !== node)
    },
    /**
     * Called when a different state is selected via the dropdown menu of a goal
     *
     * @param node
     */
    onNodeChange(node: NGoal) {
      if (node.selected === null) {
          this.deleteNode(node)
      } else {
          this.addNodes([node])
      }
    },
    /**
     * adds nodes as goals
     */
    addNodes(nodes: NGoal[]) {
      this.PatientStore.addGoals(nodes)
      this.Store.calculate()
      if (this.Store.compareConfig) {
        this.Store.calculate(true)
      }
    },
    /**
     * hides overlay
     */
    cancelOverlay() {
      this.nodesToAdd = []
      this.overlay = false
      this.filters.label.value = null
    },
    /**
     * returns label of an option
     *
     * @param option
     * @returns {*}
     */
    get_option_label(option: SOption) {
      return this.Store.labels.states[option.node][option.name]
    }
  }
})
</script>

<style lang="scss" scoped>

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

</style>
