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
    "title"
  ],
  data() {
    return {
      overlay: false,
      selected: null,
      filters: {
        'global': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'name': {operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.STARTS_WITH}]}},
      setNodes: [
        {
          name: 'LVSI',
          selected: {name: 'positive'},
          options: [{name: 'positive'}, {name: 'negative'}]
        },
        {name: 'LNM', value: 'yes', selected: {name: 'yes'}, options: [{name: 'yes'}, {name: 'no'}]},
        {
          name: 'PostGrade',
          selected: {name: 'grade_2'},
          options: [{name: 'grade_1'}, {name: 'grade_2'}, {name: 'grade_3'}]
        }
      ],
      nodes: [
        {name: 'Histology', options: [{name: 'grade_1'}, {name: 'grade_2'}, {name: 'grade_3'}]},
        {name: 'ER', options: [{name: 'positive'}, {name: 'negative'}]},
        {name: 'p53', options: [{name: 'wildtype'}, {name: 'mutant'}]},
        {name: 'Cytology', options: [{name: 'no'}, {name: 'yes'}]},
        {name: 'PR', options: [{name: 'positive'}, {name: 'negative'}]},
        {name: 'MyometrialInvasion', options: [{name: 'no'}, {name: 'lt_50'}, {name: 'ge_50'}]},
        {name: 'ER', options: [{name: 'positive'}, {name: 'negative'}]}
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
      this.nodes = this.nodes.filter(x => x !== slotProps.data);
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
