<template>
  <ChooseNet v-if="page === 'chooseNet'" @changePage="loadNetwork($event)"
             @loadLocalNet="loadLocalNet($event)"></ChooseNet>
  <Interface v-if="page === 'interface'" @changePage="page = 'chooseNet'" :network="selectedNetwork"
             :localNet="localNet"/>
</template>

<script>
import Interface from "./page-interface";
import ChooseNet from "./page-choose-net";

export default {
  name: 'App',
  components: {
    Interface,
    ChooseNet
  },
  created() {
    document.title = "RUBIN"
  },
  data() {
    return {
      page: "chooseNet",
      selectedNetwork: null,
      localNet: null
    }
  },
  methods: {
    loadNetwork(selectedNet) {
      this.page = 'interface'
      this.selectedNetwork = selectedNet
      this.localNet = null
    },
    loadLocalNet(localNet) {
      this.page = 'interface'
      this.selectedNetwork = localNet.name
      this.localNet = localNet
    }
  }
}


</script>

<style>
body, html {
  height: 100%;
  padding: 0;
  margin: 0;
  background-color: #372f5e;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  height: 90%;
}


</style>
