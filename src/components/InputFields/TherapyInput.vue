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
      current: <span v-for="sel in selection" :key="sel">{{ sel.name }}, </span>
      <br>
      {{ compareConfig.name }}: <span v-for="sel in compareConfig.config.patient.targets"
                                      :key="sel">{{ sel.name }}, </span>
    </div>

    <!--    input dialog  -->
    <Dialog header="  " v-model:visible="overlay" style="width:80%; height:90%; background:white" :modal="true"
            @hide="addTargetsFromOverlay()">
      <Listbox v-model="selected" class="p-mt-2" :options="overlayNodes" optionLabel="name"
               emptyMessage="choose evidences to add" :multiple="true"
               :filter="true" filterPlaceholder="Search">
        <template #option="slotProps">
          <i class="pi pi-check" v-if="selected && selected.find(n => n.name === slotProps.option.name)"/>
          {{ labels[slotProps.option.name] }}
        </template>
      </Listbox>
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
      overlay: false
    }
  },
  computed: {
    overlayNodes: function () {
      return this.nodes //.filter(x => this.nodesToAdd.find(node => node.name === x.name) == null)
    }
  },
  methods: {
    addTargetsFromOverlay() {
      this.$emit("addNodes", this.selected)
      this.selected = []
      this.overlay = false
    },
    deleteNode(node) {
      this.$emit("deleteNode", node)
    },
  }
}
</script>

<style lang="scss" scoped>

::v-deep(.p-tooltip) {
  padding: 10px;
  margin-right: 10px;
  display: None
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