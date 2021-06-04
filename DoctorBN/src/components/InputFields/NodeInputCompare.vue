<template>
  <DataTable id="table" :value="table" class="p-datatable-sm">
    <Column field="name" style="padding: 0; border: 0;">

    </Column>
    <Column field="value" header="current" class="optionCol">
      <template v-if="changeable" #body="slotProps">
        <div v-if="slotProps.data.selected === ''"></div>
        <div v-else>
          <Dropdown v-model="slotProps.data.selected" :options="slotProps.data.options" optionLabel="name"
                    placeholder="slotProps.data.selected" @change="onNodeChange(slotProps.data)">
          </Dropdown>
          <Button icon="pi pi-times" class="p-button-rounded p-button-secondary p-button-text"
                  @click="deleteNode(slotProps.data)"/>
        </div>
      </template>
      <template v-else #body="slotProps">
        {{ slotProps.data.selected.name }}
      </template>
    </Column>
    <Column field="value2" class="optionCol" :header="name2">
      <template #body="slotProps">
        {{ slotProps.data.selected2.name }}
      </template>
    </Column>
  </DataTable>

  <Dialog :header="'Add ' + title" v-model:visible="overlay" style="width: 50%" modal="yes" v-if="changeable">
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
                    <InputText style="width:100%" v-model="filters['name'].value" placeholder="Search"/>
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


  <Button id="addButton" icon="pi pi-plus" @click="overlay = true" v-if="changeable"></Button>

</template>


<script>
import {FilterMatchMode} from 'primevue/api';

export default {
  name: "NodeInputCompare",
  props: [
    "title",
    "nodes",
    "selection",
    "changeable",
    "selection2",
    "name2"
  ],
  data() {
    return {
      overlay: false,
      selected: null,
      filters: {
        'name': {value: null, matchMode: FilterMatchMode.STARTS_WITH}
      },
      nodesToAdd: []
    }
  },
  computed: {
    overlayNodes: function () {
      return this.nodes.filter(x => this.nodesToAdd.find(node => node.name === x.name) == null)
    },
    table: function () {
      let table = JSON.parse(JSON.stringify(this.selection))
      this.selection2.forEach(n => {
        let foundNode = table.find(a => a.name === n.name)
        if (foundNode == null) {
          table.push({
            name: n.name,
            selected: '',
            selected2: n.selected,
            options: n.options
          })
        } else {
          foundNode.selected2 = n.selected
        }
      })
      return table
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
      this.overlay = false
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

#table {
  padding: 0;
  margin: 0
}


.p-datatable-thead {
  padding: 0;
  border: 0;
}

</style>
