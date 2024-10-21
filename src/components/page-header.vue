<template style="z-index:8000">

  <Menubar :model="items" ref="menu" class="p-0 ml-1 mr-1 z-3" id="menu" style="position:relative">
    <template #end>
      <div class="flex flex-row align-center align-content-center">
        <Button class="p-button-text p-button-secondary" :label="this.$t('backToNetwork')"
                @click="NetworkSelectionDialog = true" icon="pi pi-home" style="color:#3f3f46"/>
        <div v-if="Store.network === 'endometrial cancer'" class="align-self-center">
          <img id="logoENDORISK" src="../assets/logo_endorisk.png" class="align-self-center flex"
                                                style="height: 1rem"/>
        </div>
        <div id="logo" class="r-2 align-self-center">
          <img id="logoSVG" src="../assets/RUBIN_Logo_core.svg" class="align-self-center flex"
                                                          style="height: 1.5rem"/>
        </div>
      </div>
    </template>
  </Menubar>

  <!--   dialogs/ overlays  -->

  <OverlayPanel ref="loadOverlay">
    <PatientFile @loaded="loadPatient"></PatientFile>
  </OverlayPanel>

  <Dialog :header="$t('Feedback')" v-model:visible="showFeedback" style="width: 50%" :modal="true">
    <Feedback @sendFeedback="sendFeedback"></Feedback>
  </Dialog>
  <OverlayPanel ref="networkOverlay" :header="$t('NetworkDescription')" style="width: 50%" :modal="true">
    {{ Store.description }}
  </OverlayPanel>

  <OverlayPanel ref="langOverlay">
    <Listbox v-model="$i18n.locale" :options="$i18n.availableLocales"
             @change="langChange()"/>
  </OverlayPanel>

  <Dialog :header="$t('Contact')" v-model:visible="showContact" style="width: 50%" :modal="true">

    To contact us, please use <Button label="this feedback form" link class="m-0 p-0" @click="showContact = false; showFeedback = true" />.

    <divider />

    <p> Radboudumc </p>
    <p> route 623 </p>
    <p> Grooteplein Zuid 10 </p>
    <p> 6525 GA Nijmegen </p>
    <p> The Netherlands </p>

  </Dialog>

  <Dialog :header="$t('Legal')" v-model:visible="showLegal" style="width: 50%" :modal="true">
    <h2>ENDORISK </h2>

    <DisclaimerEndorisk/>

  </Dialog>

  <Dialog v-model:visible="NetworkSelectionDialog" modal>
    <div class="m-2"> {{ $t("BackToNetworkSelection") }} <br>
    </div>
    <div class="flex justify-content-end">
      <Button class="m-2 p-button-text" @click="NetworkSelectionDialog = false"> {{ $t("Cancel") }}</Button>
      <Button class="m-2" @click="changePage()"> {{ $t("proceed") }}</Button>
    </div>

  </Dialog>

</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Feedback from "../components/Header/send-feedback.vue";
import PatientFile from "../components/Header/patient-file.vue";
import DisclaimerEndorisk from "../components/Header/diclaimer-endorisk.vue"
import {useStore} from '../store.ts';
import {usePatientStore} from "../stores/patient_store.ts";
import {PrimeIcons} from 'primevue/api';

export default defineComponent({
  name: "page-header",
  emits: ["changePage", "loadPatient", "exportCSV"],
  components: {
    Feedback,
    PatientFile,
    DisclaimerEndorisk
  },
  setup() {
    const Store = useStore()
    const PatientStore = usePatientStore()
    return {Store, PatientStore}
  },
  created() {
    this.items = this.getItems()
  },
  watch: {
      /**
       * watches patient name to update in header
       *
       * @param name
       */
    patient: function (name) {
      let configItem = this.items.find(a => a.key === "Patient")
      if (name !== "") {
        configItem.label = this.$t('File') + ": " + name
      } else {
        configItem.label = this.$t('Network')
      }
    },
      /**
       * watches compareConfig to update in header
       */
    compareConfig: function () {
      if (this.compareConfig == null) {
        this.stopComparing()
      }
    },
      /**
       * watch language to update header
       */
    language: function () {
        this.items.forEach(a => {
                a.label = this.$t(a.key)
        })
        this.items = this.getItems()
      }
  },
  computed: {
    patient: function () {
      return this.PatientStore.name
    },
    compareConfig: function () {
      return this.Store.compareConfig
    },
    language: function () {
        return this.Store.language
    }
  },
  data() {
    return {
      showFeedback: false,
      showNetworkDescription: false,
      showContact: false,
      showLegal: false,
      SavePatientName: null,
      configLabel: this.$t('startComparing'),
      NetworkSelectionDialog: false,
      items: [] as any[]
    }
  },
  methods: {
      /**
       * called when the network selection should be opened
       */
    changePage() {
      this.Store.reset(true)
      this.NetworkSelectionDialog = false
      this.$emit('changePage')
    },
      /**
       * called when compare feature is started
       */
    startComparing() {
      this.Store.compareConfig = {
        "patient": JSON.parse(JSON.stringify(this.PatientStore)),
        "predictions": JSON.parse(JSON.stringify(this.Store.predictions)),
        "explain": JSON.parse(JSON.stringify(this.Store.explain))
      }

      //change header
      let configItem = this.items.find(a => a.key === "savedConfigurations")
      configItem.label = this.$t('stopComparing')
      configItem.icon = "pi pi-fw pi-times"
      configItem.style="border: 3px solid darkviolet; border-radius: 5px;"
      configItem.command = () => {
        this.stopComparing()
      }

      // eslint-disable-next-line
      umami.track('button-compare', {network: this.Store.network});

    },
      /**
       * called when compare feature is stopped
       */
    stopComparing() {
      let configItem = this.items.find(a => a.key === "savedConfigurations")
      configItem.label = this.$t('startComparing')
      configItem.icon = PrimeIcons.BOOKMARK
      configItem.style="border: None;"
      configItem.command = () => {
        this.startComparing()
      }
      this.Store.compareConfig = null
    },
      /**
       * called when feedback is sent to close dialog
       */
    sendFeedback() {
      this.showFeedback = false
    },
      /**
       * toggles language dialog
       *
       * @param event
       */
    showLanguage(event: any) {
      this.$refs.langOverlay.toggle(event)
    },
      /**
       * changes language
       */
    langChange() {
      if (this.$i18n.locale == null) {
        this.$i18n.locale = "en"
      }

      this.Store.language = this.$i18n.locale
      this.Store.updateLabels()


    },
      /**
       * called when patient is loaded to toggle dialog
       *
       * @param event
       */
    loadPatient(event: any) {
      this.$refs.loadOverlay.toggle(event)
    },
    /**
     * formats network name shown in header
     *
     * @param networkName
     */
    format(networkName: string) {
      if (networkName.length > 15) {
        return this.capitalize(networkName).substring(0, 14) + "..."
      }
      else {
        return this.capitalize(networkName)
      }
    },

      /**
       * capitalizes each first letter of every word in a sentence
       *
       * @param string
       * @returns {string}
       */
    capitalize(string: string) {
      return string.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    },

      /**
       * returns header menu items
       *
       * @returns {Object[]}
       */
    getItems() {
      return [
        {
          label: this.$t('File') + ": " + this.PatientStore.name,
          icon: PrimeIcons.FILE,
          key: 'Patient',
          command: (event) => {
            this.loadPatient(event.originalEvent)
          },
          items: []
        },
        {
          label: this.$t('Network') + ": " + this.format(this.Store.network),
          key: 'NetworkDescription',
          icon: PrimeIcons.BOOK,
          command: (event) => {
            this.$refs.networkOverlay.toggle(event.originalEvent)
          },
          items: []
        },
        {
          key: "savedConfigurations",
          label: this.$t('startComparing'),
          icon: PrimeIcons.BOOKMARK,
          command: () => {
            this.startComparing()
          }
        },
        {
          label: this.$t('Settings'),
          key: 'Settings',
          icon: PrimeIcons.BARS,
          items: [
            {
              label: this.$t('Reset'),
              key: 'Reset',
              icon: PrimeIcons.REFRESH,
              command: () => {
                this.Store.reset(false)
              }
            },
            {
              label: this.$t('ChangeLanguage'),
              key: 'ChangeLanguage',
              icon: PrimeIcons.GLOBE,
              command: (event) => {
                this.showLanguage(event.originalEvent)
              }
            }]
        },
        {
          label: this.$t('help'),
          key: 'Help',
          icon: PrimeIcons.QUESTION_CIRCLE,
          items: [
            {
              label: this.$t('SendFeedback'),
              key: 'SendFeedback',
              icon: PrimeIcons.SEND,
              command: () => {
                this.showFeedback = true
              }
            },
            {
              label: this.$t('Contact'),
              key: 'Contact',
              icon: PrimeIcons.MAP_MARKER,
              command: () => {
                this.showContact = true
              }
            },
            {
              label: this.$t('Legal'),
              key: 'Legal',
              icon: PrimeIcons.BRIEFCASE,
              command: () => {
                this.showLegal = true
              }
            },
            {
              label: this.$t('showTutorial'),
              key: 'ShowTutorial',
              icon: PrimeIcons.QUESTION,
              command: () => {
                this.Store.tutorialStep = 1
              }
            }
          ]
        },
        {
            label: this.$t('SendFeedback'),
            key: 'SendFeedback',
            icon: PrimeIcons.SEND,
            command: () => {
              this.showFeedback = true
            }
          },
      ]
    }
  }
})
</script>

<style lang="scss" scoped>


#name {
  color: grey;
}

::v-deep(.p-submenu-list) {
  padding: 0 !important;
}

</style>