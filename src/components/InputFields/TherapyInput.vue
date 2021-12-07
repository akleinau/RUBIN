<template>
  <div style="position:relative">

  <div v-if="compareConfig == null">
          <Listbox :options="selection" :optionLabel="name" listStyle="max-height:300px"
               emptyMessage="choose therapy nodes">
        <template #option="slotProps">
          <div class="p-text-center rowContent">
            {{ labels[slotProps.option.name] }}
          <Button icon="pi pi-times" class="p-button-rounded p-button-secondary p-button-text xButton"
              @click="deleteNode(slotProps.option)"/>
          </div>
        </template>
      </Listbox>
      <Button id="AddButton" :label="$t('addTarget')" class="p-button-secondary" @click="overlay = true"></Button>
  </div>
  <div v-else>
    current: <span v-for="sel in selection" :key="sel">{{sel.name}}, </span>
    <br>
    {{ compareConfig.name }}: <span v-for="sel in compareConfig.config.patient.targets" :key="sel">{{sel.name}}, </span>
  </div>

    <!--    input dialog  -->
    <Dialog header="  " v-model:visible="overlay" style="width:50%; height:90%" :modal="true">
      <Listbox v-model="selected" :options="overlayNodes" optionLabel="name" emptyMessage="choose evidences to add"
               :filter="true" filterPlaceholder="Search"
               @change="addTarget()">
          <template #option="slotProps">
          <div v-tooltip.bottom="'Add as target'">
            {{ labels[slotProps.option.name] }}
          </div>
        </template>
      </Listbox>
      <Listbox v-model="selected2" :options="nodesToAdd" optionLabel="name" emptyMessage="..."
        listStyle="background:#e8e8e8">
        <template #option="slotProps">
          <div>
            {{ labels[slotProps.option.name] }}
            <Button icon="pi pi-times" class="p-button-rounded p-button-secondary p-button-text xButton"
              @click="deleteNodeFromOverlay(slotProps.option)"/>
          </div>
        </template>
      </Listbox>
      <div class="p-grid p-flex p-mt-2">
        <Button class="p-col-6 p-mr-1 p-ml-2" style="background:teal; border: teal" :label="$t('add')"
              @click="addTargetsFromOverlay()" />
        <Button class="p-col  p-mr-2" style="background:#56717d; border: #56717d" :label="$t('cancel')"
              @click="resetOverlay()" />
      </div>
    </Dialog>


  </div>
</template>

<script>
export default {
  name: "Target",
  emits: ["addNodes", "deleteNode"],
  props: [
    "nodes",
      "selection",
      "compareConfig",
      "labels"
  ],
  data() {
    return {
      selected: null,
      selected2: null,
      overlay: false,
      nodesToAdd: []
    }
  },
    computed: {
    overlayNodes: function() {
      return this.nodes.filter(x => this.nodesToAdd.find(node => node.name === x.name) == null)
    }
  },
  methods: {
    addTarget() {
      this.nodesToAdd.push(this.selected);
      //this.nodes = this.nodes.filter(x => x !== this.selected);
    },
    addTargetsFromOverlay() {
      this.$emit("addNodes", this.nodesToAdd)
      this.nodesToAdd = []
      this.overlay=false
    },
    resetOverlay() {
      this.nodesToAdd = []
      this.overlay=false
    },
    deleteNode(node) {
      this.$emit("deleteNode", node)
    },
    deleteNodeFromOverlay(node) {
      this.nodesToAdd = this.nodesToAdd.filter(x => x !== node)
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
  width: 100%;
  position: relative;
}

.xButton {
  position: absolute;
  right: 0%
}

</style>