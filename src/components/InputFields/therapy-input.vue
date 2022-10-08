<template>
  <div style="position:relative">

    <div v-if="Store.selectedConfig == null">
      <Listbox :options="Store.patient.targets" :optionLabel="name" listStyle="max-height:300px"
               emptyMessage="choose therapy nodes">
        <template #option="slotProps">
          <div class="p-text-center rowContent">
            {{ Store.labels[slotProps.option.name] }}
            <Button icon="pi pi-times" class="p-button-rounded p-button-secondary p-button-text xButton"
                    @click="deleteNode(slotProps.option)"/>
          </div>
        </template>
      </Listbox>
      <Button id="AddButton" :label="$t('addTarget')" class="p-button-secondary" @click="overlay = true"></Button>
    </div>
    <div v-else>
      current: <span v-for="sel in Store.patient.targets" :key="sel">{{ sel.name }}, </span>
      <br>
      {{ Store.selectedConfig.name }}: <span v-for="sel in Store.selectedConfig.config.patient.targets"
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
          {{ Store.labels[slotProps.option.name] }}
        </template>
      </Listbox>
    </Dialog>


  </div>
</template>

<script>
import { useStore } from '@/store'

export default {
  name: "therapy-input",
  setup() {
    const Store = useStore()
    return { Store }
  },
  data() {
    return {
      selected: null,
      overlay: false
    }
  },
  computed: {
    overlayNodes: function () {
      if (this.Store.currentPhase != null) {
        let phaseNodes = this.Store.phases.find(x => x.name=this.Store.currentPhase)
        return this.Store.patient.nodes.filter(x =>phaseNodes.sets.target.includes(x.name))
      }
      return this.Store.patient.nodes //.filter(x => this.nodesToAdd.find(node => node.name === x.name) == null)
    }
  },
  methods: {
    addTargetsFromOverlay() {
      this.Store.addTargets(this.selected)
      this.selected = []
      this.overlay = false
    },
    deleteNode(node) {
      this.Store.deleteTarget(node)
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