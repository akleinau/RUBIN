<template>
  <!-- Form to upload a network file -->
  <form @submit.prevent="upload" id="upload-form" enctype="multipart/form-data">
    <label>{{ $t('NetworkName') }}:
      <InputText id="net-name" type="text" required/>
    </label>
    <br><br>
    <FileUpload name="net-upload" url="./upload" accept=".net, .bif" :customUpload="true" :chooseLabel="$t('Choose')"
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
      let displayName = document.getElementById('net-name').value;
      let netDescription = document.getElementById('net-description').value;
      let fileField = this.file;
      if (fileField === null) {
        alert("Error: Please upload a file")
      } else if (fileField.length > 1) {
        alert("Error: Please only upload one file")
      } else {
        //open network
        let reader = new FileReader()
        reader.readAsText(fileField[0])
        let nameSplit = fileField[0].name.split(".")
        let fileFormat = nameSplit[nameSplit.length - 1]
        let thisRef = this
        reader.onload = async function () {
          let fileString = reader.result
          console.log(fileString)
          let localNet = {
            "name": displayName,
            "description": netDescription,
            "fileFormat": fileFormat,
            "fileString": fileString
          }
          thisRef.$emit("loadLocalNet", localNet);

          if (this.uploadToServer) {
            //send request to upload to server
          let gResponse = await fetch("https://doctorbn-backend.herokuapp.com/sendNetworkRequest", {
            method: 'POST',
            headers: {
              'content-type': 'application/json'
            },
            body: JSON.stringify({
              name: localNet.name,
              fileString: localNet.fileString,
              fileFormat: localNet.fileFormat,
            })
          })
          let result = await gResponse.json();
          console.log(result)
          }
        }
      }
    }
  }
}


</script>

<style scoped>

</style>