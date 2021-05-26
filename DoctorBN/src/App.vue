<template>
  <ChooseNet v-if="page === 'chooseNet'" @changePage="loadNetwork"></ChooseNet>
  <Interface v-if="page === 'interface'" @changePage="page = 'chooseNet'"/>
</template>

<script>
import Interface from "./Interface";
import ChooseNet from "./ChooseNet";

export default {
  name: 'App',
  components: {
    Interface,
    ChooseNet
  },
  data () {
    return {
      page: "interface",
      selectedNetwork: null
    }
  },
  methods: {
    loadNetwork(selectedID) {
      this.page = 'interface'
      this.selectedNetwork = selectedID
    }
  }
}


</script>

<style>
body, html {
  height: 100%;
  padding: 0;
  margin: 0;
  background-color: #6eb5be;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-color: #6eb5be;
}

.p-panel-content {
  height: 333px
}

</style>
