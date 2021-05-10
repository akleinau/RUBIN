<template>
  <UploadNetwork></UploadNetwork>
</template>

<script>
import UploadNetwork from "./components/UploadNetwork";

export default {
  name: 'App',
  components: {
    UploadNetwork
  }
}


</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
