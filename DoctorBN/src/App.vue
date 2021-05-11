<template>
<Interface />
  <UploadNetwork></UploadNetwork>
</template>

<script>
import Interface from "./Interface";
import UploadNetwork from "./components/UploadNetwork";

export default {
  name: 'App',
  components: {
    Interface,
    UploadNetwork
  }
}


</script>

<style>
body, html {
  height: 100%;
  padding: 0;
  margin: 0
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-color: #6eb5be;
  height: 100%;
}

</style>
