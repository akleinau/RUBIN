<template>
  <form @submit.prevent="openNet" method="POST" id="selectNetForm" name="selectNetForm">
    <label for="selectID">Select a network</label> <br>
    <select id="selectID" form="selectNetForm" v-model="networks" required>
      <option v-for="network in networks" v-bind:key="network" v-bind:value="network.id" >{{ network.name }}</option>
    </select>
    <br>
    <Button type="submit">Open network</Button>
  </form>
</template>

<script>
export default {
  name: "LoadNetworkList",
  data() {
    return {
      networks: []
    }
  },
  methods: {
    onChange(event) {
      console.log(event.target.value)
    },
    openNet: async function () {
      let selectID = document.getElementById('selectedID')
      let selected = selectID.options[selectID.selectedIndex].value
      console.log(selected)
      let formData = new FormData();
      formData.append('selection', selected)
      fetch('http://localhost:5000//openNetwork', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      this.$emit("changePage")
    },
    loadNetList: async function () {
      const gResponse = await fetch("http://localhost:5000//loadNetList");
      const netList = await gResponse.json();
      this.networks = []
      for (let key in netList) {
        this.networks.push({id: key, name: netList[key]})
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