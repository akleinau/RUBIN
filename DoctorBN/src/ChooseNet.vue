<template>
  <Upload></Upload>
  <Networklist></Networklist>
  <Button @click="changePage()">open</Button>
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
    changePage() {
      this.$emit("changePage")
    }
  }
}
</script>

<style scoped>

</style>