<template>
  <div style="position:relative">

      <Listbox :options="Store.patient.targets" listStyle="max-height:300px"
               emptyMessage=" ">
        <template #option="slotProps">
          <div class="text-center rowContent">
            {{ Store.labels.nodes[slotProps.option.name] }}
            <Button icon="pi pi-times" class="p-button-rounded p-button-secondary p-button-text xButton"
                    @click="deleteNode(slotProps.option)"/>
          </div>
        </template>
      </Listbox>
      <Button id="AddButton" :label="$t('addTarget')" class="p-button-secondary" @click="overlay = true"></Button>

    <!--    input dialog  -->
    <Dialog header="  " v-model:visible="overlay" style="width:80%; height:90%; background:white" :modal="true"
    :closable="false">
      <template #header>
      <div class="flex justify-content-end w-full">
        <Button class="mr-2" :label="this.$t('add')" icon="pi pi-check" @click="addTargetsFromOverlay()"/>
        <Button class="p-button-secondary" :label="this.$t('Cancel')" icon="pi pi-times" @click="cancelOverlay"/>
      </div>
    </template>
      <Listbox v-model="selected" class="t-2" :options="overlayNodes" optionLabel="label"
               emptyMessage="" :multiple="true"
               :filter="true" filterPlaceholder="Search">
        <template #option="slotProps">
          <i class="pi pi-check" v-if="selected && selected.find(n => n.name === slotProps.option.name)"/>
          {{ Store.labels.nodes[slotProps.option.name] }}
        </template>
      </Listbox>
    </Dialog>


  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {useStore} from '../../store.ts';
import {NTarget, NNode} from "../../types/node_types.ts";

export default defineComponent({
  name: "options-input",
  setup() {
    const Store = useStore()
    return {Store}
  },
  data() {
    return {
      selected: null as NTarget[] | null,
      overlay: false
    }
  },
  computed: {
    /**
     * returns nodes that should be displayed in overlay
     *
     * @returns {Object[]}
     */
    overlayNodes: function () : NTarget[] {
        let nodes = JSON.parse(JSON.stringify(this.Store.patient.nodes))
        nodes.forEach((n: (NNode|NTarget)) => n.label=this.Store.labels.nodes[n.name])
        return nodes
    }
  },
  methods: {
    /**
     * adds selected nodes from overlay to targets
     */
    addTargetsFromOverlay() {
      if (this.selected != null) {
        this.Store.addTargets(this.selected)
        this.Store.calculate()
      }
      this.selected = []
      this.overlay = false
    },
    /**
     * deletes target
     *
     * @param node
     */
    deleteNode(node: NTarget) {
      this.Store.deleteTarget(node)
      this.Store.calculate()
    },
    /**
     * hides overlay
     */
    cancelOverlay() {
      this.selected = []
      this.overlay = false
    }
  }
})
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