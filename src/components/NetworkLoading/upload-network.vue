<template>
  <!-- Form to upload a network file -->
  <form @submit.prevent="upload" id="upload-form" enctype="multipart/form-data">
    <FileUpload name="net-upload" url="./upload" accept=".net, .bif" :customUpload="true" :chooseLabel="$t('Upload')"
                mode="basic" @uploader="upload" :auto="true" data-umami-event="button-own-network"
                required/>
  </form>
</template>

<script>
export default {
  name: "upload-network",
  emits: ["reloadNetList", "loadLocalNet"],
  methods: {
      /**
       * loads interface using uploaded file
       *
       * @param event
       */
    upload(event) {
      console.log("upload")
      let fileField = event.files;
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
        }
      }
    }
  }
}


</script>

<style scoped>

</style>