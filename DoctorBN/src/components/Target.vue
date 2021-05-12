<template>
  <div style="position:relative">
    <Panel header="Target">

      <Listbox v-model="selected" :options="targets" optionLabel="name"
               @change="onTargetChange()" listStyle="max-height:300px">
        <template #option="slotProps">
          <div>
            {{ slotProps.option.name }}: {{ slotProps.option.value }}
          </div>
        </template>
      </Listbox>
      <Button id="AddButton" icon="pi pi-plus" @click="overlay = true"></Button>
    </Panel>

    <Dialog header="Add Evidence" v-model:visible="overlay" style="width: 50%">
      <Button class="p-mb-1" label="Add evidences" style="width: 100%" @click="addTargetsFromOverlay()"/>
      <Listbox v-model="selected2" :options="nodesToAdd" optionLabel="name" emptyMessage="choose evidences to add">
        <template #option="slotProps">
          <div>
            {{ slotProps.option.name }}
          </div>
        </template>
      </Listbox>
      <Listbox v-model="selected" :options="nodes" optionLabel="name" emptyMessage="choose evidences to add"
               :filter="true" filterPlaceholder="Search" @change="addTarget()" >
          <template #option="slotProps">
          <div v-tooltip.bottom="'Add as target'">
            {{ slotProps.option.name }}
          </div>
        </template>
      </Listbox>
    </Dialog>

  </div>
</template>

<script>
export default {
  name: "Target",
  data() {
    return {
      selected: null,
      selected2: null,
      overlay: false,
      targets: [
        {name: 'Therapy', value: 'radiotx'},
        {name: '1yr Survival', value: 'yes'},
        {name: '5yr Survival', value: 'yes'}
      ],
      nodes: [
        {name: 'Histology'},
        {name: 'ER'},
        {name: 'p53'},
        {name: 'Cytology'},
        {name: 'PR'},
        {name: 'MyometrialInvasion'},
        {name: 'ER'}
      ],
      nodesToAdd: []
    }
  },
  methods: {
    getLabel(event) {
      return event.name + event.code;
    },
    onTargetChange() {
      this.$emit("setTarget", this.selected);
    },
    addTarget() {
      this.nodesToAdd.push(this.selected);
      this.nodes = this.nodes.filter(x => x !== this.selected);
    },
    addTargetsFromOverlay() {
      this.targets = this.targets.concat(this.nodesToAdd)
      this.nodesToAdd = []
      this.overlay=false
    }
  }
}
</script>

<style lang="scss" scoped>

::v-deep(.p-tooltip) {
  padding: 10px;
  margin-right: 10px;
  display:None
}

#AddButton {
  width: 100%
}
</style>