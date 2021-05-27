<template>
  <!-- Form to upload a network file -->
  <form @submit.prevent="upload" id = "upload-form" enctype="multipart/form-data">
    <h3>Upload new network</h3>
    <span>Network name:<input id = "net-name" type = "text" required/> <br></span>
    <input name = "net-upload" type = "file" accept=".bif" required/> <br>
    <input name = "net-submit" type = "submit" value = "Upload Network"/>
  </form>
</template>

<script>
export default {
  name: "UploadNetwork",
  methods: {
    upload: async function() {
      let uploadForm = document.getElementById('upload-form');
      let displayName = document.getElementById('net-name').value;
      let fileField = uploadForm.querySelector('input[type="file"]');
      let formData = new FormData();
      formData.append('displayName', displayName);
      formData.append('file', fileField.files[0]);
      let options = {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'application/json'
        }
      }
      delete options.headers['Content-Type'];
      let res = await fetch('http://localhost:5000//uploadNetwork', options);
      let resData = await res.json()
      if (resData === 'error1') {
        alert("ERROR: The network name already exists, try again");
        uploadForm.reset()
      } else if (resData === 'error2') {
        alert("ERROR: The filename is already in use, try again");
        uploadForm.reset()
      } else if (resData === 'successful') {
        alert("The upload was successful!");
        uploadForm.reset()
        this.$emit("reloadNetList");
      }
    }
  }
}



</script>

<style scoped>

</style>