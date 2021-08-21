<template>
  <!-- Form to upload a network file -->
  <form @submit.prevent="upload" id="upload-form" enctype="multipart/form-data">
    <label>{{ $t('NetworkName') }}:
      <InputText id="net-name" type="text" required/>
    </label>
    <br><br>
    <FileUpload name="net-upload" url="./upload" accept=".net" :customUpload="true" :chooseLabel="$t('Choose')"
                :cancelLabel="$t('Cancel')" :auto="true" :showUploadButton="false" @uploader="file = $event.files"
                required/>
    <br>
    <label>{{ $t('OptDescription') }}: <Textarea id="net-description"></Textarea></label>
    <br><br>
    <Checkbox v-model="uploadToServer" :value="true" disabled="disabled"></Checkbox>
    <label>upload to server</label>
  </form>
  <Button name="net-submit" type="submit" :label="$t('UploadNet')" @click="upload()"/>
</template>

<script>
export default {
  name: "UploadNetwork",
  emits: ["reloadNetList", "loadLocalNet"],
  data() {
    return {
      file: null,
      uploadToServer: null
    }
  },
  methods: {
    upload: async function () {
      let uploadForm = document.getElementById('upload-form');
      let displayName = document.getElementById('net-name').value;
      let netDescription = document.getElementById('net-description').value;
      let fileField = this.file;
      if (fileField === null) {
        alert("Error: Please upload a file")
      } else if (fileField.length > 1) {
        alert("Error: Please only upload one file")
      } else {
        //upload file to server
        if (this.uploadToServer) {
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
          let res = await fetch('https://doctorbn-backend.herokuapp.com/uploadNetwork', options);
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
        //open network
        let reader = new FileReader()
        reader.readAsText(fileField[0])
        let thisRef = this
        reader.onload = function () {
          let localNet = {"name": displayName, "description": netDescription, "fileFormat": "net", "fileString": reader.result}
          thisRef.$emit("loadLocalNet", localNet);
        };
      }
    }
  }
}


</script>

<style scoped>

</style>