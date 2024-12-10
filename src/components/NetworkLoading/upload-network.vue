<template>
  <!-- Form to upload a network file -->
  <form @submit.prevent="upload" id="upload-form" enctype="multipart/form-data">
    <div class="flex justify-content-center align-items-center mb-2">
      <div class="flex justify-content-center">
        <Checkbox v-model="checked" class="mb-3 mr-2" binary/>
        <label>add custom configuration file</label>
      </div>

      <div v-if="checked" class="mb-2 ml-2">
        <FileUpload name="custom-upload" url="./upload" accept=".json" :customUpload="true" :chooseLabel="$t('Upload')"
                    mode="basic" @uploader="upload_custom" :auto="true" class="p-button-outlined"
                    required/>
      </div>
      <div v-if="checked" class="ml-2 mb-3">
        {{ customName }}
      </div>
    </div>


    <FileUpload name="net-upload" url="./upload" accept=".net, .bif" :customUpload="true" :chooseLabel="$t('Upload')"
                mode="basic" @uploader="upload" :auto="true"
                required/>
  </form>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: "upload-network",
  emits: ["reloadNetList", "loadLocalNet"],
  data() {
    return {
      checked: false,
      customText: "",
      customName: "",
    }
  },
  methods: {
      /**
       * loads interface using uploaded file
       *
       * @param event
       */
    upload(event: any) {
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
          let localNet = {
            "name": nameSplit[0],
            "description": "",
            "fileFormat": fileFormat,
            "fileString": fileString,
            "customText": thisRef.checked? thisRef.customText : ""
          }
          thisRef.$emit("loadLocalNet", localNet);
        }
      }
    },

    upload_custom(event: any) {
      console.log("upload custom")
      let fileField = event.files;
      if (fileField.length === 0) {
        alert("Error: Please upload a file")
      } else if (fileField.length > 1) {
        alert("Error: Please only upload one file")
      } else {
        let reader = new FileReader()
        reader.readAsText(fileField[0])
        this.customName = fileField[0].name
        let thisRef = this
        reader.onload = async function () {
          let fileString = reader.result
          //if filestring is a string, save it
          if (typeof fileString === "string") {
            thisRef.customText = fileString
          }
        }
      }
    }


  }
})


</script>

<style scoped>

</style>