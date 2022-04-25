<template>

  <Menubar :model="items" ref="menu" class="p-p-0 p-m-0" style="position:relative; z-index:10">
    <template #end>
      <div class="p-d-flex p-jc-between p-ai-center p-mt-0" style="background-color:#f8f9fa">
        <div id="name"> {{ $t('Network') }}: <b>{{ Store.network }}</b>,
          {{ $t('Patient') }}:
          <InputText type="text" v-model="Store.patient.name"
                     style="background-color:#fefefe"/>
        </div>
        <div id="logo" class="p-mr-2"><img src="../assets/DoctorBN_Logo.png" style="height: 20px"></div>
      </div>
    </template>
  </Menubar>

<!--   dialogs/ overlays  -->
  <Dialog :header="$t('Feedback')" v-model:visible="showFeedback" style="width: 50%" :modal="true">
    <Feedback @sendFeedback="sendFeedback($event)"></Feedback>
  </Dialog>
  <Dialog :header="$t('NetworkDescription')" v-model:visible="showNetworkDescription" style="width: 50%" :modal="true">
    {{ Store.description }}
  </Dialog>
  <OverlayPanel ref="compareOverlay" style="width: 50%">
    <Compare @saveConfig="saveConfig($event)" :configurations="Store.configurations" @compareTo="compareTo($event)"
             @load="load($event)" @deleteConfig="deleteConfig($event)"/>
  </OverlayPanel>

  <OverlayPanel ref="exportOverlay">
    <label> {{ $t("name") }}: </label>
    <InputText type="text" v-model="Store.patient.name"></InputText>
    <Button :label="$t('save')" @click="exportCSV()"/>
  </OverlayPanel>

  <OverlayPanel ref="langOverlay" >
     <Listbox v-model="$i18n.locale" :options="$i18n.availableLocales" :key="`locale-${locale}`" :value="locale" @change="langChange()"/>
  </OverlayPanel>

</template>

<script>
import Feedback from "@/components/Header/Feedback";
import Compare from "@/components/Header/Compare";
import { useStore } from '@/store'

export default {
  name: "Header",
  emits: ["changePage","loadPatient", "exportCSV"],
  components: {
    Feedback,
    Compare
  },
  setup() {
    const Store = useStore()
    return { Store }
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
  methods: {
    changePage() {
      this.$emit('changePage')
    },
    reset() {
      this.Store.reset()
    },
    loadPatient(event) {
      this.$emit('loadPatient', event)
    },
    exportPatientOverlay(event) {
      this.$refs.exportOverlay.toggle(event)
    },
    exportCSV() {
      const csv = this.Store.createCSVcontent();

      const anchor = document.createElement('a');
      anchor.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
      anchor.target = '_blank';
      anchor.download = this.Store.patient.name + '.csv';
      anchor.click();

      this.$refs.exportOverlay.toggle()
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
      configItem.label = this.$t("savedConfigurations")
      configItem.icon = ""
      configItem.command = (event) => {
        this.$refs.compareOverlay.toggle(event.originalEvent)
      }
      this.$emit("compareTo", null)
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