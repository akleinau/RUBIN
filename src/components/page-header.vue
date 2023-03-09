<template>

  <Menubar :model="items" ref="menu" class="p-0 ml-1 mr-1" id="menu" style="position:relative">
    <template #end>
      <div class="flex flex-row align-center">
        <Button class="p-button-text p-button-secondary" :label="this.$t('backToNetwork')"
                @click="NetworkSelectionDialog = true" icon="pi pi-home" style="color:#3f3f46"/>
        <div id="logo" class="r-2 align-self-center"><img id="logoSVG" src="../assets/RUBIN_Logo_core.svg"
                                                          style="height: 1.5rem">
        </div>
      </div>
    </template>
  </Menubar>

  <!--   dialogs/ overlays  -->

  <OverlayPanel ref="loadOverlay">
    <LoadPatient @loaded="loadPatient"></LoadPatient>
  </OverlayPanel>

  <Dialog :header="$t('Feedback')" v-model:visible="showFeedback" style="width: 50%" :modal="true">
    <Feedback @sendFeedback="sendFeedback"></Feedback>
  </Dialog>
  <OverlayPanel ref="networkOverlay" :header="$t('NetworkDescription')" style="width: 50%" :modal="true">
    {{ Store.description }}
  </OverlayPanel>

  <OverlayPanel ref="langOverlay">
    <Listbox v-model="$i18n.locale" :options="$i18n.availableLocales" :key="`locale-${locale}`" :value="locale"
             @change="langChange()"/>
  </OverlayPanel>

  <Dialog v-model:visible="NetworkSelectionDialog" modal>
    <div class="m-2"> {{$t("BackToNetworkSelection")}} <br>
    </div>
    <div class="flex justify-content-end">
      <Button class="m-2 p-button-text" @click="NetworkSelectionDialog = false"> {{$t("Cancel")}}</Button>
      <Button class="m-2" @click="changePage()"> {{$t("proceed")}}</Button>
    </div>

  </Dialog>

</template>

<script>
import Feedback from "@/components/Header/send-feedback";
import LoadPatient from "@/components/Header/load-patient";
import {useStore} from '@/store'
import {PrimeIcons} from 'primevue/api';

export default {
  name: "page-header",
  emits: ["changePage", "loadPatient", "exportCSV"],
  components: {
    Feedback,
    LoadPatient
  },
  setup() {
    const Store = useStore()
    return {Store}
  },
  watch: {
    patient: function (name) {
      let configItem = this.items.find(a => a.key === "Patient")
      if (name !== "") {
        configItem.label = this.$t('File') + ": " + name
      } else {
        configItem.label = this.$t('Network')
      }
    },
    compareConfig: function() {
      if (this.compareConfig == null) {
        this.stopComparing()
      }
    }
  },
  computed: {
    patient: function () {
      return this.Store.patient.name
    },
    compareConfig: function () {
      return this.Store.compareConfig
    },
  },
  data() {
    return {
      showFeedback: false,
      showNetworkDescription: false,
      SavePatientName: null,
      configLabel: this.$t('startComparing'),
      NetworkSelectionDialog: false,
      items: [
        {
          label: this.$t('File') + ": " + this.Store.patient.name,
          icon: PrimeIcons.FILE,
          key: 'Patient',
          command: (event) => {
            this.loadPatient(event.originalEvent)
          },
          items: []
        },
        {
          label: this.$t('Network') + ": " + this.capitalize(this.Store.network),
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
              command: () => {
                this.Store.reset(false)
              }
            },
            {
              label: this.$t('ChangeLanguage'),
              key: 'ChangeLanguage',
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
              label: this.$t('showTutorial'),
              key: 'ShowTutorial',
              icon: PrimeIcons.QUESTION,
              command: () => {
                this.Store.tutorialStep = 1
              }
            }
          ]
        }
      ]
    }
  },
  methods: {
    changePage() {
      this.Store.reset(true)
      this.NetworkSelectionDialog = false
      this.$emit('changePage')
    },
    startComparing() {
      this.Store.compareConfig = {
        "patient": JSON.parse(JSON.stringify(this.Store.patient)),
        "predictions": JSON.parse(JSON.stringify(this.Store.predictions)),
        "explain": JSON.parse(JSON.stringify(this.Store.explain))
      }

      //change header
      let configItem = this.items.find(a => a.key === "savedConfigurations")
      configItem.label = this.$t('stopComparing')
      configItem.icon = "pi pi-fw pi-times"
      configItem.command = () => {
        this.stopComparing()
      }
    },
    stopComparing() {
      let configItem = this.items.find(a => a.key === "savedConfigurations")
      configItem.label = this.$t('startComparing')
      configItem.icon = PrimeIcons.BOOKMARK
      configItem.command = () => {
        this.startComparing()
      }
      this.Store.compareConfig = null
    },
    sendFeedback() {
      this.showFeedback = false
    },
    showLanguage(event) {
      this.$refs.langOverlay.toggle(event)
    },
    langChange() {
      if (this.$i18n.locale == null) {
        this.$i18n.locale = "en"
      }

      this.items.forEach(a => {
        a.label = this.$t(a.key)
      })
      this.Store.language = this.$i18n.locale
      this.Store.updateLabels()
    },
    loadPatient(event) {
      this.$refs.loadOverlay.toggle(event)
    },

    capitalize(string) {
      //capitalizes each first letter of every word in a sentence
      return string.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    },
  }
}
</script>

<style lang="scss" scoped>


#name {
  color: grey;
}

::v-deep(.p-submenu-list) {
  padding: 0 !important;
}

</style>