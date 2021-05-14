<template>
  <UploadNetwork v-if="page === 'chooseNet'" @changePage="page = 'interface'"></UploadNetwork>
  <Interface v-if="page === 'interface'" @changePage="page = 'chooseNet'"/>
</template>

<script>
import Interface from "./Interface";
import UploadNetwork from "./components/UploadNetwork";

export default {
  name: 'App',
  components: {
    Interface,
    UploadNetwork
  },
  data () {
    return {
      page: "interface"
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

</style>
