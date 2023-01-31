<template>
  <form @submit.prevent="openNetwork" method="POST" id="selectNetForm" name="selectNetForm">
    <Listbox v-model="selectedNetwork" ref="selectMenu" :filter="true" empty-message="Loading networks ..."
             emptyFilterMessage="No networks found" :options="networks" option-label="name"
             placeholder="Select a network" required/>
    <br>
    <Button type="submit">{{ $t('openNetwork') }}</Button>
  </form>
</template>

<script>
export default {
  name: "load-network-list",
  emits: ["changePage", "updated"],
  data() {
    return {
      networks: [],
      selectedNetwork: ''
    }
  },
  methods: {
    openNetwork: async function () {
      if (typeof (this.$refs.selectMenu.modelValue.name) == 'undefined') {
        alert("No network selected")
        return
      }
      let selectedNet = this.$refs.selectMenu.modelValue.name

      this.$emit("changePage", selectedNet)
    },
    loadNetList: async function () {
      const gResponse = await fetch("https://doctorbn-backend.herokuapp.com/loadNetList");
      const netList = await gResponse.json();
      this.networks = []
      for (const key in netList) {
        this.networks.push({name: netList[key]})
      }
      if (this.networks.length > 0) {
        this.selectedNetwork = this.networks[0]
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