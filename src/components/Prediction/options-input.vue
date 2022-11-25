<template>
  <div style="position:relative">

    <div v-if="Store.compareConfig == null">
      <Listbox :options="Store.patient.targets" :optionLabel="name" listStyle="max-height:300px"
               emptyMessage=" ">
        <template #option="slotProps">
          <div class="text-center rowContent">
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
      compare: <span v-for="sel in Store.compareConfig.patient.targets"
                                             :key="sel">{{ sel.name }}, </span>
    </div>

    <!--    input dialog  -->
    <Dialog header="  " v-model:visible="overlay" style="width:80%; height:90%; background:white" :modal="true"
    :closable="false">
      <template #header>
      <div class="flex justify-content-end w-full">
        <Button class="mr-2" label="add" icon="pi pi-check" @click="addTargetsFromOverlay()"/>
        <Button class="p-button-secondary" label="cancel" icon="pi pi-times" @click="cancelOverlay"/>
      </div>
    </template>
      <Listbox v-model="selected" class="t-2" :options="overlayNodes" optionLabel="name"
               emptyMessage="" :multiple="true"
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
import {useStore} from '@/store'

export default {
  name: "therapy-input",
  setup() {
    const Store = useStore()
    return {Store}
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
        return this.Store.patient.nodes.filter(x => this.Store.currentPhase.sets.target.includes(x.name))
      }
      return this.Store.patient.nodes //.filter(x => this.nodesToAdd.find(node => node.name === x.name) == null)
    }
  },
  methods: {
    addTargetsFromOverlay() {
      if (this.selected != null) {
        this.Store.addTargets(this.selected)
        this.Store.calculate()
      }
      this.selected = []
      this.overlay = false
    },
    deleteNode(node) {
      this.Store.deleteTarget(node)
      this.Store.calculate()
    },
    cancelOverlay() {
      this.selected = []
      this.overlay = false
    }
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