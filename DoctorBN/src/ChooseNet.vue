<template>
  <div class="p-grid p-nested-grid p-flex-column p-mx-1" >
    <Card class="p-col">
      <template #content>
        <div id="logo"> <img src="./assets/DoctorBN_Logo.png" style="height: 100px" /> </div>
      </template>
    </Card>

    <div class="p-col p-grid vertical-container " style="height:100%">
      <div class="p-col box-stretched" >
        <Card class=" box-stretched" >
          <template #title>
            Upload a new network
          </template>
          <template #content>
            <Upload ref="uploadField" @reloadNetList="$refs.netList.loadNetList()"></Upload>
            <br>

          </template>
        </Card>
      </div>
      <div class="p-col  box-stretched" >
        <Card class=" box-stretched" >
          <template #title>
            Select a network
          </template>
          <template #content>
            <Networklist ref="netList" @updated="$forceUpdate()" @changePage="changePage"></Networklist>
          </template>
        </Card>

      </div>
    </div>

    <Card class=" p-col">
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
import Upload from "./components/NetworkLoading/UploadNetwork";
import Networklist from "./components/NetworkLoading/LoadNetworkList"

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
    changePage(selectedNet) {
      this.$emit("changePage", selectedNet)
    }
  }
}
</script>

<style scoped>

.box-stretched {
  height: 100%
}

</style>