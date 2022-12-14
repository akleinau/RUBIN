<template>
  <ScrollPanel class="max-h-screen">
  <div class="grid nested-grid flex-column m-1 overflow-hidden">
    <Card id="header">
      <template #content>
        <img src="./assets/RUBIN_Logo.svg" style="height: 150px"/>
        <Dropdown v-model="$i18n.locale" :options="$i18n.availableLocales" :key="`locale-${$i18n.locale}`"
                  :value="$i18n.locale"
                  style="position:absolute; right:5%; top: 5%"/>
      </template>
    </Card>

    <div class="col grid vertical-container ">
      <div class="col  stretched">
        <Card class=" stretched">
          <template #title>
            {{ $t('selectNetwork') }}
          </template>
          <template #content>
            <Networklist ref="netList" @updated="$forceUpdate()" @changePage="changePage"/>
          </template>
        </Card>
      </div>
      <div class="col stretched">
        <Card class=" stretched">
          <template #title>
            {{ $t('uploadNetwork') }}
          </template>
          <template #content>
            <Upload ref="uploadField" @reloadNetList="$refs.netList.loadNetList()"
                    @loadLocalNet="loadLocalNet($event)"></Upload>
            <br> <br>
          </template>
        </Card>
      </div>
    </div>

    <Card class=" col">
      <template #title>
        <div class="text-left">FAQ</div>
      </template>
      <template #content>
        <Accordion class="text-left">
          <AccordionTab header="What is DoctorBN?">
            DoctorBN is a tool to use Bayesian networks in clinical decision support. Bayesian networks provide a
            knowledge base about a specific topic. The clinician can insert data
            about his current patient and what he wants to achieve. DoctorBN will then provide information on what
            the network thinks would be the best treatment for the patient, to achieve these goals.
            <br> <br>
            DoctorBN is currently in development, feedback is welcome and appreciated!
            The best way to reach us is through the person that sent you the link to this website.
          </AccordionTab>
          <AccordionTab header="What are Bayesian networks?">
            Bayesian networks are a type of artificial intelligence that is especially equipped to handle probabilities.
            In clinical decision support, Bayesian networks can provide clinicians with a second opinion which
            intervention
            would be the best option for their patient.
          </AccordionTab>
          <AccordionTab header="Who is the team behind DoctorBN?">
            DoctorBN is the bachelor project of Alex Mo and Anna Kleinau.
          </AccordionTab>
        </Accordion>
      </template>
    </Card>
  </div>

  <Dialog v-model:visible="langOverlay" :modal="true" :dismissableMask="true">
    Choose language:
    <Listbox v-model="$i18n.locale" :options="$i18n.availableLocales" :key="`locale-${$i18n.locale}`"
             :value="$i18n.locale"/>
  </Dialog>
  </ScrollPanel>
</template>

<script>
import Upload from "./components/NetworkLoading/upload-network";
import Networklist from "./components/NetworkLoading/load-network-list"

export default {
  name: "page-choose-net",
  emits: ["changePage", "loadLocalNet"],
  data() {
    return {
      page: "chooseNet",
      langOverlay: false
    }
  },
  components: {
    Upload,
    Networklist
  },
  mounted() {
    this.langOverlay = true
  },
  methods: {
    changePage(selectedNet) {
      this.$emit("changePage", selectedNet)
    },
    loadLocalNet(localNet) {
      this.$emit("loadLocalNet", localNet)
    }
  }
}
</script>

<style lang="scss" scoped>

.stretched {
  height: 100%
}

::v-deep(.p-button.p-fileupload-choose){
        margin: auto !important;
}

::v-deep(#header) {
  .p-card-body {
    padding:0;
  }
}

</style>
