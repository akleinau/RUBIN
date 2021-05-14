<template>
  <div>
    <h4>Select a network</h4>
    <form action="/openNetwork" method="POST" id="selectNetForm">
      <select form = "selectNetForm">
        <option v-for="network in networks" v-bind:key="network.id" value = network.id >{{network.displayName}}</option>
      </select>
    </form>

  </div>
</template>

<script>
export default {
  name: "LoadNetworkList",
  data() {
    return{
      networks: []
    }
  },
  created: async function() {
    const gResponse = await fetch("http://localhost:5000/loadNetList");
    const netlist = await gResponse.json();
    let networksArray = []
    for (var key in netlist) {
      this.networks.push({id: parseInt(key, 10), displayName: netlist[key]})
    }
    this.networks = networksArray
  }
}
</script>

<style scoped>

</style>