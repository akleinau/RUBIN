<template>
  <Panel :header="title" style="position: relative">
    <div>
      <DataTable id="table" :value="setNodes" :scrollable="true" scrollHeight="300px"
                 dataKey="id" v-model:filters="filters" filterDisplay="menu"
                 :globalFilterFields="['name']">
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
            <Button icon="pi pi-times" class="p-button-rounded p-button-secondary p-button-text"  />
          </template>
        </Column>
      </DataTable>
      <Button id="addButton" icon="pi pi-plus" @click="overlay = true"></Button>
    </div>
    <Dialog :header="'Add ' + title" v-model:visible="overlay" style="width: 50%">
      <Button class="p-mb-1" label="Add evidences" style="width: 100%" @click="addNodesFromOverlay()"/>
      <Listbox v-model="selected" :options="nodesToAdd" optionLabel="name" emptyMessage="choose evidences to add">
        <template #option="slotProps">
          <div>
            {{ slotProps.option.name }}: {{ slotProps.option.selected.name }}
          </div>
        </template>
      </Listbox>
      <DataTable :value="nodes">
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
import {FilterMatchMode,FilterOperator} from 'primevue/api';
export default {
  name: "Evidence",
  props: [
    "title",
      "nodes"
  ],
  data() {
    return {
      overlay: false,
      selected: null,
      filters: {
        'global': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'name': {operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.STARTS_WITH}]}},
      setNodes: [
      ],
      nodesToAdd: []
    }
  },
  methods: {
    onNodeChange() {
      this.$emit("setNodes", this.items);
    },
    addOption(slotProps, option) {
      console.log({slotProps, option})
      let item = {
        name: slotProps.data.name,
        selected: {name: option.name},
        options: slotProps.data.options
      }
      this.nodesToAdd.push(item);
      //this.nodes = this.nodes.filter(x => x !== slotProps.data);
    },
    addNodesFromOverlay() {
      this.setNodes = this.setNodes.concat(this.nodesToAdd)
      this.nodesToAdd = []
      this.overlay=false
    }
  }
}
</script>

<style lang="scss" scoped>
#evidence {
  background-color: white;
}

#addButton {
  width: 100%
}

#table{
  padding: 0;
  margin: 0
}

::v-deep(#table .p-datatable-thead){
  display: None !important
}

::v-deep(.p-datatable-tbody) {
  float: right
}

</style>
