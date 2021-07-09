<template>
      <DataTable :class="{NoHeader: hideHeader}"   id="table" :value="selection" class="p-datatable-sm">
        <Column field="name" style="padding: 0; border: 0;">
          <template #header class="table-header" v-if="title === 'Evidence'" >
            <span class="p-input-icon-left" >
              <i class="pi pi-search" />
              <InputText v-model="filters['name'].name" placeholder="Search..." style="width: 200%"/>
            </span>
          </template>
        </Column>
        <Column field="value" class="optionCol">
          <template v-if="changeable" #body="slotProps">
            <Dropdown v-model="slotProps.data.selected" :options="slotProps.data.options" optionLabel="name"
                      placeholder="slotProps.data.selected" @change="onNodeChange(slotProps.data)" >
            </Dropdown>
            <Button icon="pi pi-times" class="p-button-rounded p-button-secondary p-button-text p-p-0 p-m-0"
                    @click="deleteNode(slotProps.data)" />
          </template>
          <template v-else #body="slotProps">
            {{slotProps.data.selected.name}}
          </template>
        </Column>
      </DataTable>

    <Dialog header="  " v-model:visible="overlay" style="width: 50%" :modal="true" v-if="changeable">
      <Button class="p-mb-1" icon="pi pi-plus" style="width: 100%" @click="addNodesFromOverlay()"/>
      <Listbox v-model="selected" :options="nodesToAdd" optionLabel="name" emptyMessage="...">
        <template #option="slotProps">
          <div>
            {{ slotProps.option.name }}: {{ slotProps.option.selected.name }}
              <Button icon="pi pi-times" class="p-button-rounded p-button-secondary p-button-text xButton"
              @click="deleteNodeFromOverlay(slotProps.option)"/>
          </div>
        </template>
      </Listbox>
      <DataTable :value="overlayNodes" :scrollable="true" scrollHeight="500px" class="p-datatable-sm"
                 v-model:filters="filters" filterDisplay="menu" data-key="name">
        <template #header>
            <div class="p-d-flex p-jc-between">
                <span class="p-input-icon-right" style="width:100%">
                    <InputText style="width:100%" v-model="filters['name'].value" placeholder="Search" />
                  <i class="pi pi-search"/>
                </span>
            </div>
        </template>
        <Column field="name" :header="$t('Node')"></Column>
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


      <Button id="addButton" icon="pi pi-plus" @click="overlay = true" v-if="changeable"></Button>

</template>


<script>
import {FilterMatchMode} from 'primevue/api';
export default {
  name: "Evidence",
  emits: ["addNodes", "deleteNode"],
  props: [
    "title",
      "nodes",
      "selection",
      "changeable",
      "hideHeader"
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
    },
    onNodeChange(node) {
    this.$emit("addNodes", [node])
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


.p-datatable-thead{
  padding: 0;
  border: 0;
}


  .NoHeader ::v-deep(.p-datatable-thead){
  display: None !important
  }

::v-deep(.p-dropdown-label){
    padding-right: 0;
    margin: 0;
}

</style>
