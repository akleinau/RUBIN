<template>
    <div class="grid nested-grid flex flex-column m-1 mt-0 pt-2 overflow-hidden">
      <Card id="header" class="mr-2 ml-2">
        <template #content>
          <div class="flex flex-column">
            <img src="./assets/RUBIN_Logo.svg" class="h-8rem lg:h-9rem xl:h-10rem"/>
            <div>
              <Dropdown v-model="$i18n.locale" :options="$i18n.availableLocales" :key="`locale-${$i18n.locale}`"
                        :value="$i18n.locale" @change="languageChanged"
                        class=" mr-2 ml-2 "/>
            </div>
          </div>
        </template>
      </Card>

      <div class="col grid vertical-container ">
        <div class="col-12 md:col-6 lg:col-6 xl:col-6 ">
          <Card class=" stretched">
            <template #title>
              {{ $t('selectNetwork') }}
            </template>
            <template #content>
              <SelectNetwork ref="netList" @updated="$forceUpdate()" @changePage="changePage"/>
            </template>
          </Card>
        </div>
        <div class="col-12 md:col-6 lg:col-6 xl:col-6">
          <Card class=" stretched">
            <template #title>
              {{ $t('uploadNetwork') }}
            </template>
            <template #content>
              <UploadNetwork ref="uploadField" @reloadNetList="$refs.netList.loadNetList()"
                      @loadLocalNet="loadLocalNet($event)"></UploadNetwork>
              <br> <br>
            </template>
          </Card>
        </div>
      </div>

      <Card class=" col mr-2 ml-2">
        <template #title>
          <div class="text-left">FAQ</div>
        </template>
        <template #content>
          <Accordion class="text-left">
            <AccordionTab header="What is RUBIN?">
              RUBIN is a tool to use Bayesian networks in clinical decision support. Bayesian networks provide a
              knowledge base about a specific topic. The clinician can insert data
              about his current patient and what they want to achieve. RUBIN will then provide information on what
              the network thinks would be the outcome or best treatment for the patient.
              <br> <br>
              RUBIN is currently in development, feedback is welcome and appreciated!
              The best way to reach us is through the person that sent you the link to this website.
            </AccordionTab>
            <AccordionTab header="What are Bayesian networks?">
              Bayesian networks are a type of artificial intelligence that is especially equipped to handle
              probabilities.
              In clinical decision support, Bayesian networks can provide clinicians with a second opinion based on
              statistics and AI.
            </AccordionTab>
            <AccordionTab header="Who is the team behind RUBIN?">
              RUBIN is a cooperation of PLRI Hannover (previously with OVGU Magdeburg), University of Twente,
              The Netherlands and Radboud University Medical Center, The Netherlands.
            </AccordionTab>
          </Accordion>
        </template>
      </Card>

      <FooterComponent />

    </div>

    <Dialog v-model:visible="langOverlay" :modal="true" :dismissableMask="true">
      Choose language:
      <Listbox v-model="$i18n.locale" :options="$i18n.availableLocales" :key="`locale-${$i18n.locale}`"
               :value="$i18n.locale" @change="languageChanged"/>
    </Dialog>

</template>

<script>
import UploadNetwork from "./components/NetworkLoading/upload-network.vue";
import SelectNetwork from "./components/NetworkLoading/select-network.vue"
import FooterComponent from "./components/footer-component.vue"

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
    UploadNetwork,
    SelectNetwork,
    FooterComponent
  },
  mounted() {
    this.langOverlay = false //set to true for lang overlay
  },
  methods: {
    changePage(selectedNet) {
      this.$emit("changePage", selectedNet)
    },
    loadLocalNet(localNet) {
      this.$emit("loadLocalNet", localNet)
    },
    languageChanged(event) {
      if (event.value == null) {
        this.$i18n.locale = "en"
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.stretched {
  height: 100%
}

::v-deep(.p-button.p-fileupload-choose) {
  margin: auto !important;
}

::v-deep(#header) {
  .p-card-body {
    padding: 0;
  }
}

</style>
