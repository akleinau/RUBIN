<template>

  <Menubar :model="items" ref="menu" class="p-0 -0" style="position:relative; z-index:10">
    <template #end>
      <div id="logo" class="r-2"><img src="../assets/DoctorBN_Logo.png" style="height: 1.5rem"></div>
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
  <OverlayPanel ref="compareOverlay" style="width: 50%">
    <Compare @saveConfig="saveConfig($event)" :configurations="Store.configurations" @compareTo="compareTo($event)"
             @load="load($event)" @deleteConfig="deleteConfig($event)"/>
  </OverlayPanel>

  <OverlayPanel ref="langOverlay">
    <Listbox v-model="$i18n.locale" :options="$i18n.availableLocales" :key="`locale-${locale}`" :value="locale"
             @change="langChange()"/>
  </OverlayPanel>

</template>

<script>
import Feedback from "@/components/Header/send-feedback";
import Compare from "@/components/Header/compare-configs";
import LoadPatient from "@/components/Header/load-patient";
import {useStore} from '@/store'
import {PrimeIcons} from 'primevue/api';

export default {
  name: "page-header",
  emits: ["changePage", "loadPatient", "exportCSV"],
  components: {
    Feedback,
    Compare,
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
        configItem.label = "Patient: " + name
      } else {
        configItem.label = "Patient"
      }
    }
  },
  computed: {
    patient: function () {
      return this.Store.patient.name
    }
  },
  data() {
    return {
      showFeedback: false,
      showNetworkDescription: false,
      SavePatientName: null,
      configLabel: "saved configurations",
      items: [
        {
          label: this.$t('Settings'),
          key: 'Settings',
          icon: PrimeIcons.BARS,
          items: [
            {
              label: this.$t('Reset'),
              key: 'Reset',
              command: () => {
                this.reset()
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
          label: "Patient " + this.Store.patient.name,
          icon: PrimeIcons.USER,
          key: 'Patient',
          command: (event) => {
            this.loadPatient(event.originalEvent)
          },
          items: []
        },
        {
          label: this.$t('Network') + ": " + this.Store.network,
          key: 'NetworkDescription',
          icon: PrimeIcons.BOOK,
          command: (event) => {
            this.$refs.networkOverlay.toggle(event.originalEvent)
          },
          items: []
        },
        {
          key: "savedConfigurations",
          label: this.$t("compare"),
          icon: PrimeIcons.BOOKMARK,
          command: (event) => {
            this.$refs.compareOverlay.toggle(event.originalEvent)
          },
          items: []
        },
        {
          label: "Help",
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
              label: "Show tutorial",
              key: 'ShowTutorial',
              icon: PrimeIcons.QUESTION,
              command: () => {
                this.Store.showTutorial = true
              }
            }
          ]
        },
        {
          label: this.$t("backToNetwork"),
          key: 'backToNetwork',
          icon: PrimeIcons.HOME,
          command: () => {
            this.changePage()
          }
        }
      ]
    }
  },
  methods: {
    changePage() {
      this.$emit('changePage')
    },
    reset() {
      this.Store.reset()
    },
    compareTo(name) {
      let configItem = this.items.find(a => a.key === "savedConfigurations")
      configItem.label = this.$t("ComparingTo") + name
      configItem.icon = "pi pi-fw pi-times"
      configItem.command = () => {
        this.stopComparing()
      }
      this.Store.selectedConfig = this.Store.configurations.find(a => a.name === name)
      this.$refs.compareOverlay.toggle()
    },
    stopComparing() {
      let configItem = this.items.find(a => a.key === "savedConfigurations")
      configItem.label = this.$t("Compare")
      configItem.icon = PrimeIcons.BOOKMARK
      configItem.command = (event) => {
        this.$refs.compareOverlay.toggle(event.originalEvent)
      }
      this.Store.selectedConfig = null
    },
    load(name) {
      let configuration = this.Store.configurations.find(a => a.name === name)
      this.Store.patient = configuration.config.patient
      this.Store.options = configuration.config.options
      this.Store.explain = configuration.config.explain
      this.Store.newGoals = configuration.config.newGoals
      this.$refs.compareOverlay.toggle()
    },
    deleteConfig(name) {
      this.Store.configurations = this.Store.configurations.filter(a => a.name !== name)
    },
    saveConfig(name) {
      this.Store.configurations.push({
        "name": name,
        "config": {
          "patient": JSON.parse(JSON.stringify(this.Store.patient)),
          "options": JSON.parse(JSON.stringify(this.Store.options)),
          "explain": JSON.parse(JSON.stringify(this.Store.explain)),
          "newGoals": JSON.parse(JSON.stringify(this.Store.newGoals))
        }
      })
    },
    sendFeedback() {
      this.showFeedback = false
    },
    showLanguage(event) {
      this.$refs.langOverlay.toggle(event)
    },
    langChange() {
      this.items.forEach(a => {
        a.label = this.$t(a.key)
      })
    },
    openLoadForm(event) {
      console.log(event)
      this.$refs.panel.toggle(event)
    },
    loadPatient(event) {
      this.$refs.loadOverlay.toggle(event)
    }
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