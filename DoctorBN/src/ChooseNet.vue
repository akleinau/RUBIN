<template>
  <div class="p-grid p-nested-grid p-flex-column">
    <Card class="p-m-2 p-col">
      <template #title>
        <div id="logo">DoctorBN</div>
      </template>
    </Card>

    <div class="p-col p-grid vertical-container " style="position:relative; height:100%">
      <div class="p-col box-stretched" style="position:relative">
        <Card class="p-m-2 box-stretched" style="position:relative">
          <template #title>
            Upload a new network
          </template>
          <template #content>
            <Upload ref="uploadField" @reloadNetList="this.$refs.netList.loadNetList()"></Upload>
            <br>

          </template>
        </Card>
      </div>
      <div class="p-col  box-stretched" style="position:relative">
        <Card class="p-m-2 box-stretched" style="position:relative">
          <template #title>
            Select a network
          </template>
          <template #content>
            <Networklist ref="netList" @changePage="changePage"></Networklist>
          </template>
        </Card>

      </div>
    </div>

    <Card class="p-m-2 p-col">
      <template #title >
        <div class="p-text-left">FAQ</div>
      </template>
      <template #content>
        <Accordion>
          <AccordionTab header="What is DoctorBN?">
            Content
          </AccordionTab>
          <AccordionTab header="What are bayesian networks?">
            Content
          </AccordionTab>
          <AccordionTab header="Who is the team behind DoctorBN?">
            Content
          </AccordionTab>
        </Accordion>
      </template>
    </Card>
  </div>
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
#logo {
  font-size: 2em;
  color: teal
}

.box-stretched {
  height: 100%
}

</style>