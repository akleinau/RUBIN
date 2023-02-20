<template>
  <!-- Form to upload a network file -->
  <form @submit.prevent="upload" id="upload-form" enctype="multipart/form-data">
    <FileUpload name="net-upload" url="./upload" accept=".net, .bif" :customUpload="true" :chooseLabel="$t('Choose')"
                :showUploadButton="false" @select="file = $event.files" :showCancelButton="false"
                required/>
    <br>
  </form>
  <br><br>
  <Button v-if="file.length !== 0" name="net-submit" type="submit" :label="$t('UploadNet')" @click="upload()"/>
</template>

<script>
export default {
  name: "upload-network",
  emits: ["reloadNetList", "loadLocalNet"],
  data() {
    return {
      file: [],
      uploadToServer: null,
    }
  },
  methods: {
    upload: async function () {
      let fileField = this.file;
      if (fileField.length === 0) {
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
            "name": nameSplit[0],
            "description": "",
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