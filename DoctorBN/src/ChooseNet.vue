<template>
  <Upload ref="uploadField" @reloadNetList="this.$refs.netList.loadNetList()"></Upload>
  <br>
  <Networklist ref="netList" @changePage="changePage"></Networklist>
</template>

<script>
import Upload from "./components/UploadNetwork";
import Networklist from "./components/LoadNetworkList"

export default {
  name: "ChooseNet",
  data() {
    return {
      page: "chooseNet"
    }
  },
  components: {
    Upload,
    Networklist
  },
  methods: {
    changePage(selectedID) {
      this.$emit("changePage", selectedID)
    }
  }
}
</script>

<style scoped>

</style>