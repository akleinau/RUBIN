<template>
  <!-- Form to upload a network file -->
  <form @submit.prevent="upload" id = "upload-form" enctype="multipart/form-data">
    <label>Network name: <InputText id = "net-name" type = "text" required/> </label>
    <br><br>
    <FileUpload name = "net-upload" url="./upload" accept=".bif" :customUpload="true"
                auto="true" :showUploadButton="false" @uploader="file = $event.files"  required/>
    <br>
    <label><Textarea id = "net-description"></Textarea></label>
    <Button name = "net-submit" type = "submit" label = "Upload Network" @click="upload()"/>
  </form>
</template>

<script>
export default {
  name: "UploadNetwork",
  data() {
    return {
      file: null,
    }
  },
  methods: {
    upload: async function() {
      let uploadForm = document.getElementById('upload-form');
      let displayName = document.getElementById('net-name').value;
      let netDescription = document.getElementById('net-description').value;
      let fileField = this.file;
      let formData = new FormData();
      formData.append('displayName', displayName);
      formData.append('file', fileField[0]);
      formData.append('netDescription', netDescription);
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