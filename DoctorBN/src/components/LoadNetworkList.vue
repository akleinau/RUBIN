<template>
  <form @submit.prevent="openNetwork" method="POST" id="selectNetForm" name="selectNetForm">
    <dropdown v-model="selectedNetwork" ref="selectMenu" :filter="true" empty-message="No networks, upload one above" emptyFilterMessage="No networks found" :options="networks" option-label="name" placeholder="Select a network" required/>
    <br>
    <Button type="submit">Open network</Button>
  </form>
</template>

<script>
export default {
  name: "LoadNetworkList",
  data() {
    return {
      networks: [],
      selectedNetwork: ''
    }
  },
  methods: {
    openNetwork: async function () {
      if (typeof(this.$refs.selectMenu.modelValue.netID) == 'undefined') {
        alert("No network selected")
        return
      }
      let selectedID = this.$refs.selectMenu.modelValue.netID
      fetch('http://localhost:5000/openNetwork', {
        method: 'POST',
        body: JSON.stringify(selectedID),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      this.$emit("changePage", selectedID)
    },
    loadNetList: async function () {
      const gResponse = await fetch("http://localhost:5000//loadNetList");
      const netList = await gResponse.json();
      this.networks = []
      for (const key in netList) {
        this.networks.push({netID: key, name: netList[key]})
      }
    }
  },
  created: function () {
    this.loadNetList()
  }
}
</script>

<style scoped>

</style>