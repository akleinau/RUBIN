<template>

  <Menubar :model="items" ref="menu" class="p-p-0 p-m-0" style="position:relative; z-index:10">
    <template #end>
      <div class="p-d-flex p-jc-between p-ai-center p-mt-0" style="background-color:#f8f9fa">
        <div id="name"> {{ $t('Network') }}: <b>{{ NetworkName }}</b>,
          {{ $t('Patient') }}:
          <InputText type="text" v-model="SavePatientName" @change="$emit('setName', SavePatientName)"
                     style="background-color:#fefefe"/>
        </div>
        <div id="logo" class="p-mr-2"><img src="../assets/DoctorBN_Logo.png" style="height: 20px"></div>
      </div>
    </template>
  </Menubar>


  <Dialog :header="$t('Feedback')" v-model:visible="showFeedback" style="width: 50%" :modal="true">
    <Feedback @sendFeedback="sendFeedback($event)"></Feedback>
  </Dialog>
  <Dialog :header="$t('NetworkDescription')" v-model:visible="showNetworkDescription" style="width: 50%" :modal="true">
    {{ description }}
  </Dialog>
  <OverlayPanel ref="compareOverlay" style="width: 50%">
    <Compare @saveConfig="saveConfig($event)" :configurations="configurations" @compareTo="compareTo($event)"
             @load="load($event)" @deleteConfig="deleteConfig($event)"/>
  </OverlayPanel>

  <OverlayPanel ref="exportOverlay">
    <label> {{ $t("name") }}: </label>
    <InputText type="text" v-model="SavePatientName"></InputText>
    <Button :label="$t('save')" @click="exportCSV()"/>
  </OverlayPanel>

  <OverlayPanel ref="langOverlay" >
     <Listbox v-model="$i18n.locale" :options="$i18n.availableLocales" :key="`locale-${locale}`" :value="locale" @change="langChange()"/>
  </OverlayPanel>

</template>

<script>
import Feedback from "@/components/Header/Feedback";
import Compare from "@/components/Header/Compare";


export default {
  name: "Header",
  emits: ["setName", "changePage", "reset", "loadPatient", "exportCSV", "compareTo", "load", "deleteConfig", "sendFeedback", "saveConfig"],
  components: {
    Feedback,
    Compare
  },
  props: [
    "configurations", "NetworkName", "PatientName", "description"
  ],
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
          label: this.$t('LoadPatient'),
          key: 'LoadPatient',
          command: (event) => {
            this.loadPatient(event.originalEvent)
          }
        },
        {
          label: this.$t('SavePatient'),
          key: 'SavePatient',
          command: (event) => {
            this.exportPatientOverlay(event.originalEvent)
          }
        },
        {
          label: this.$t('SendFeedback'),
          key: 'SendFeedback',
          command: () => {
            this.showFeedback = true
          }
        },
        {
          label: this.$t('NetworkDescription'),
          key: 'NetworkDescription',
          command: () => {
            this.showNetworkDescription = true
          }
        },
        {
          key: "savedConfigurations",
          label: this.$t("savedConfigurations"),
          command: (event) => {
            this.$refs.compareOverlay.toggle(event.originalEvent)
          }
        },
        {
          label: this.$t("backToNetwork"),
          key: 'backToNetwork',
          command: () => {
            this.changePage()
          }
        }
      ]
    }
  },
  watch: {
    PatientName: function () {
      this.SavePatientName = this.PatientName
    }
  },
  methods: {
    changePage() {
      this.$emit('changePage')
    },
    reset() {
      this.$emit('reset')
    },
    loadPatient(event) {
      this.$emit('loadPatient', event)
    },
    exportPatientOverlay(event) {
      this.$refs.exportOverlay.toggle(event)
    },
    exportCSV() {
      this.$emit('exportCSV', this.SavePatientName)
      this.$refs.exportOverlay.toggle()
    },
    compareTo(name) {
      let configItem = this.items.find(a => a.key === "savedConfigurations")
      configItem.label = this.$t("ComparingTo") + name
      configItem.icon = "pi pi-fw pi-times"
      configItem.command = () => {
        this.stopComparing()
      }
      this.$emit("compareTo", name)
      this.$refs.compareOverlay.toggle()
    },
    stopComparing() {
      let configItem = this.items.find(a => a.key === "savedConfigurations")
      configItem.label = this.$t("savedConfigurations")
      configItem.icon = ""
      configItem.command = (event) => {
        this.$refs.compareOverlay.toggle(event.originalEvent)
      }
      this.$emit("compareTo", null)
    },
    load(name) {
      this.$emit('load', name)
      this.$refs.compareOverlay.toggle()
    },
    deleteConfig(name) {
      this.$emit('deleteConfig', name)
    },
    saveConfig(name) {
      this.$emit('saveConfig', name)
    },
    sendFeedback(description) {
      this.$emit("sendFeedback", description)
      this.showFeedback = false
    },
    showLanguage(event) {
      this.$refs.langOverlay.toggle(event)
    },
    langChange() {
      this.items.forEach( a => {
        a.label = this.$t(a.key)
      })
    }
  }
}
</script>

<style scoped>


#name {
  color: grey;
}

</style>