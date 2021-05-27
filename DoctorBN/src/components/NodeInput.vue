<template>
  <Panel :header="title" style="position: relative">
    <div>
      <DataTable id="table" :value="selection" :scrollable="true" scrollHeight="300px">
        <Column field="name">
          <template #header class="table-header">
            <span class="p-input-icon-left">
              <i class="pi pi-search"/>
              <InputText v-model="filters['name'].name" placeholder="Search..." style="width: 200%"/>
            </span>
          </template>
        </Column>
        <Column field="value" class="optionCol">
          <template #body="slotProps">
            <Dropdown v-model="slotProps.data.selected" :options="slotProps.data.options" optionLabel="name"
                      placeholder="slotProps.data.selected" @change="onNodeChange()" >
            </Dropdown>
            <Button icon="pi pi-times" class="p-button-rounded p-button-secondary p-button-text"
                    @click="deleteNode(slotProps.data)" />
          </template>
        </Column>
      </DataTable>
      <Button id="addButton" icon="pi pi-plus" @click="overlay = true"></Button>
    </div>
    <Dialog :header="'Add ' + title" v-model:visible="overlay" style="width: 50%" modal="yes">
      <Button class="p-mb-1" :label="'Add ' + title" style="width: 100%" @click="addNodesFromOverlay()"/>
      <Listbox v-model="selected" :options="nodesToAdd" optionLabel="name" emptyMessage="choose evidences to add">
        <template #option="slotProps">
          <div>
            {{ slotProps.option.name }}: {{ slotProps.option.selected.name }}
              <Button icon="pi pi-times" class="p-button-rounded p-button-secondary p-button-text xButton"
              @click="deleteNodeFromOverlay(slotProps.option)"/>
          </div>
        </template>
      </Listbox>
      <DataTable :value="overlayNodes" :scrollable="true" scrollHeight="500px"
                 v-model:filters="filters" filterDisplay="menu" data-key="name">
        <template #header>
            <div class="p-d-flex p-jc-between">
                <span class="p-input-icon-right" style="width:100%">
                    <InputText style="width:100%" v-model="filters['name'].value" placeholder="Search" />
                  <i class="pi pi-search"/>
                </span>
            </div>
        </template>
        <Column field="name" :header="title"></Column>
        <Column field="options">
          <template #body="slotProps">
            <Button class="p-m-2" v-for="option in slotProps.data.options" :key="option"
                    @click="addOption(slotProps, option)">
              <i class="pi pi-plus"></i> &nbsp; {{ option.name }}
            </Button>

          </template>
        </Column>
      </DataTable>
    </Dialog>
  </Panel>
</template>


<script>
import {FilterMatchMode} from 'primevue/api';
export default {
  name: "Evidence",
  props: [
    "title",
      "nodes",
      "selection"
  ],
  data() {
    return {
      overlay: false,
      selected: null,
      filters: {
        'name': {value: null, matchMode: FilterMatchMode.STARTS_WITH}},
      nodesToAdd: []
    }
  },
  computed: {
    overlayNodes: function() {
      return this.nodes.filter(x => this.nodesToAdd.find(node => node.name === x.name) == null)
    }
  },
  methods: {
    addOption(slotProps, option) {
      let item = {
        name: slotProps.data.name,
        selected: {name: option.name},
        options: slotProps.data.options
      }
      this.nodesToAdd.push(item);
      this.filters.name.value = null
    },
    addNodesFromOverlay() {
      this.$emit("addNodes", this.nodesToAdd);
      this.nodesToAdd = []
      this.overlay=false
    },
    deleteNode(node) {
      this.$emit("deleteNode", node);
    },
     deleteNodeFromOverlay(node) {
      this.nodesToAdd = this.nodesToAdd.filter(x => x !== node)
    }
  }
}
</script>

<style lang="scss" scoped>
#evidence {
  background-color: white;
}

#addButton {
  width: 100%;
  position: relative;
}

#table{
  padding: 0;
  margin: 0
}

::v-deep(#table .p-datatable-thead){
  display: None !important
}

.p-panel {
  color: red;
  height: 100% !important;

  display: grid;
  grid-template-rows: auto 1fr;
}

::v-deep(.p-panel-content) {
height: 100% !important;
}



</style>
