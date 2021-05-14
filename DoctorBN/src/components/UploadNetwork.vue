<template>
  <!-- Form to upload a network file -->
  <form action="http://localhost:5000/uploadNetwork" method="POST" enctype="multipart/form-data">
    <h3>Upload new network</h3>
    <span>Network name:<input name = "net_name" type = "text"/> <br></span>
    <input name = "net_upload" type = "file" ref="netFile"/> <br>
    <input name = "net_submit" type = "submit" value = "Upload Network"/>
  </form>
</template>

<script>
export default {
  name: "UploadNetwork",
  data() {
    return {
      networks: []
    }
  }
}



</script>

<style scoped>

</style>