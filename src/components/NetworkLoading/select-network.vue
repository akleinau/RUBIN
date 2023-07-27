<template>
  <form @submit.prevent="openNetwork" method="POST" id="selectNetForm" name="selectNetForm">
    <Listbox v-model="selectedNetwork" ref="selectMenu" :filter="true" empty-message="Loading networks ..."
             emptyFilterMessage="No networks found" :options="networks" option-label="name"
             placeholder="Select a network" required @click="clicked"/>
    <br>
    <Button type="submit" data-umami-event="button-preselect-network">{{ $t('openNetwork') }}</Button>
  </form>
</template>

<script>
export default {
  name: "select-network",
  emits: ["changePage", "updated"],
  data() {
    return {
      networks: [],
      selectedNetwork: '',
      prevSelectedNetwork: ''
    }
  },
  methods: {
      /**
       * Gets called when an element of the network list is clicked
       */
    clicked: function () {
        //open network in case of double click (the component natually deselects the element if you do that)
      if (this.selectedNetwork === null) {
        this.selectedNetwork = this.prevSelectedNetwork
        this.openNetwork()
      }
      this.prevSelectedNetwork = this.selectedNetwork
    },
      /**
       * opens interface using selected network
       *
       * @returns {Promise<void>}
       */
    openNetwork: async function () {
      if (typeof (this.selectedNetwork.name) == 'undefined') {
        alert("No network selected")
        return
      }
      let selectedNet = this.selectedNetwork.name

      this.$emit("changePage", selectedNet)
    },
      /**
       * loads network list from server
       *
       * @returns {Promise<void>}
       */
    loadNetList: async function () {
      const gResponse = await fetch("https://doctorbn-backend.herokuapp.com/loadNetList");
      const netList = await gResponse.json();
      this.networks = []
      for (const key in netList) {
        this.networks.push({name: netList[key]})
      }
      if (this.networks.length > 0) {
        this.selectedNetwork = this.networks[0]
        this.prevSelectedNetwork = this.selectedNetwork
      }

      this.$emit('updated')
    }
  },
  created: function () {
    this.loadNetList()
  }
}
</script>

<style scoped>

</style>