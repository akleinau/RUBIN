<template>
  <!-- Form to upload a network file -->
  <form action="/uploadNetwork" method="POST" enctype="multipart/form-data">
    <h3>Upload new network</h3>
    <span>Network name: <input name = "net_name" type = "text" v-model="networks.name"/> <br></span>
    <input name = "net_upload" type = "file" ref="netFile" @change="selectFile"/> <br>
    <input name = "net_submit" type = "submit" value = "Upload Network"/>
  </form>
  <Button @click="changePage()">open</Button>
</template>

<script>
export default {
  name: "UploadNetwork",
  data() {
    return {
      networks: []
    }
  },
  methods: {
    addNewNetwork: function() {
      this.networks.push({
        name: this.networks.name
      })
      console.log(this.networks)
    },
    changePage() {
      this.$emit("changePage")
}
    //TODO: Method that adds saved networks to list
  }
}



</script>

<style scoped>

</style>