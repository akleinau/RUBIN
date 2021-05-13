<template>
  <div style="position:relative">
    <Panel header="Therapy">

      <Listbox v-model="selected" :options="targets" optionLabel="name" listStyle="max-height:300px">
        <template #option="slotProps">
          <div class="p-text-center rowContent">
            {{ slotProps.option }}
          <Button icon="pi pi-times" class="p-button-rounded p-button-secondary p-button-text xButton" />
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
            {{ slotProps.option }}
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
  props: [
    "nodes"
  ],
  data() {
    return {
      selected: null,
      selected2: null,
      overlay: false,
      targets: [],
      nodesToAdd: []
    }
  },
  methods: {
    addTarget() {
      this.nodesToAdd.push(this.selected.name);
      //this.nodes = this.nodes.filter(x => x !== this.selected);
    },
    addTargetsFromOverlay() {
      this.targets = this.targets.concat(this.nodesToAdd)
      this.nodesToAdd = []
      console.log(this.targets)
      this.$emit("update", this.targets)
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

.rowContent {
  position: relative;
  display: flex;
justify-content: center;
align-items: center;
}

#AddButton {
  width: 100%
}

.xButton {
  position: absolute;
  right: 0%
}

</style>