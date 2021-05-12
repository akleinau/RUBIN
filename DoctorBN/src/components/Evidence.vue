<template>
  <div style="position: relative">
    <Panel header="Evidence">
          <Button id="addButton" icon="pi pi-plus" @click="overlay = true" style="z-index:1"></Button>


    <DataTable :value="evidence" :scrollable="true" scrollHeight="300px" >
      <Column field="name">
      </Column>
      <Column field="value">
        <template #body="slotProps">
          <Dropdown v-model="slotProps.data.selected" :options="slotProps.data.options" optionLabel="name"
                    placeholder="slotProps.data.selected" @change="onEvidenceChange()">
          </Dropdown>
        </template>
      </Column>
    </DataTable>

</Panel>
    <Dialog header="Add Evidence" v-model:visible="overlay" style="width: 50%">
      <Button class="p-mb-1" label="Add evidences" style="width: 100%" @click="addEvidencesFromOverlay()"/>
      <Listbox v-model="selected" :options="nodesToAdd" optionLabel="name" emptyMessage="choose evidences to add">
        <template #option="slotProps">
          <div>
            {{ slotProps.option.name }}: {{ slotProps.option.selected.name }}
          </div>
        </template>
      </Listbox>
      <DataTable :value="nodes">
      <Column field="name" header="Evidence"></Column>
      <Column field="options">
        <template #body="slotProps">
            <Button class="p-m-2" v-for="option in slotProps.data.options" :key="option" @click="addOption(slotProps, option)">
              <i class="pi pi-plus"></i> &nbsp; {{option.name}}
            </Button>

        </template>
      </Column>
      </DataTable>
    </Dialog>
  </div>
</template>


<script>
export default {
  name: "Evidence",
  data() {
    return {
      overlay: false,
      selected: null,
      evidence: [
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
        {name: 'ER', options: [{name: 'positive'},{name: 'negative'}]},
        {name: 'p53', options: [{name: 'wildtype'}, {name: 'mutant'}]},
        {name: 'Cytology', options: [{name: 'no'}, {name: 'yes'}]},
        {name: 'PR', options: [{name: 'positive'},{name: 'negative'}]},
        {name: 'MyometrialInvasion', options: [{name: 'no'}, {name:'lt_50'},{name:'ge_50'}]},
        {name: 'ER', options: [{name: 'positive'},{name: 'negative'}]}
      ],
      nodesToAdd: [
      ]
    }
  },
  methods: {
    onEvidenceChange() {
      this.$emit("setEvidence", this.items);
    },
    addOption(slotProps, option ) {
      console.log({slotProps, option })
      let item = {
        name: slotProps.data.name,
        selected: {name: option.name},
        options: slotProps.data.options
      }
      this.nodesToAdd.push(item);
      this.nodes = this.nodes.filter(x => x !== slotProps.data);
    },
    addEvidencesFromOverlay() {
      this.evidence = this.evidence.concat(this.nodesToAdd)
      this.nodesToAdd = []
    }
  }
}
</script>

<style lang="scss" scoped>
#evidence {
  background-color: white;
}

#addButton {
  position: absolute;
  right: 0%;
  top: 0%;
  margin: 5px;
}

.table-header {
    display: None;
}

</style>