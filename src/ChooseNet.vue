<template>
  <div class="p-grid p-nested-grid p-flex-column p-mx-1" >
    <Card class="p-col">
      <template #content>
        <div id="logo"> <img src="./assets/DoctorBN_Logo.png" style="height: 100px" /> </div>
      </template>
    </Card>

    <div class="p-col p-grid vertical-container " style="height:100%">
      <div class="p-col stretched" >
        <Card class=" stretched" >
          <template #title>
             {{ $t('uploadNetwork') }}
          </template>
          <template #content>
            <Upload ref="uploadField" @reloadNetList="$refs.netList.loadNetList()"></Upload>
            <br> <br>
          Uploading networks is disabled in this version.
          </template>
        </Card>
      </div>
      <div class="p-col  stretched" >
        <Card class=" stretched" >
          <template #title>
            {{  $t('selectNetwork') }}
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
        <Accordion class="p-text-left">
          <AccordionTab header="What is DoctorBN?">
            DoctorBN is a tool to use bayesian networks in clinical decision support. Bayesian networks provide a
            knowledge base about a specific topic. The clinician can input data
            about his current patient and what he wants to achieve. DoctorBN will then provide information on what
            the network thinks would be the best treatment for the patient, to achieve these goals.
            <br> <br>
            DoctorBN is currently in development, feedback is welcome and appreciated!
            The best way to reach us is through the person that sent you the link to this website.
          </AccordionTab>
          <AccordionTab header="What are bayesian networks?">
            Bayesian networks are a type of artificial intelligence that is especially equipped to handle probabilities.
            In clinical decision support, bayesian networks can provide clinicians with a second opinion which intervention
            would be the best option for their patient.
          </AccordionTab>
          <AccordionTab header="Who is the team behind DoctorBN?">
            DoctorBN is the bachelor project of Alex Mo and Anna Kleinau.
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

.stretched {
  height: 100%
}

</style>
