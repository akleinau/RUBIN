<template>
  <div class="p-d-flex p-jc-between p-ai-center" style="background-color:white">
      <Menubar :model="items" ref="menu"/>
  <div id="name"> Network: <b>{{NetworkName}}</b>,
    Patient: <InputText type="text" v-model="SavePatientName" @change="$emit('setName', SavePatientName)"/></div>
  <div id="logo" class="p-mr-2"> <img src="../assets/DoctorBN_Logo.png" style="height: 20px"></div>
  </div>

  <Dialog header="Feedback" v-model:visible="showFeedback"  style="width: 50%" modal="yes">
    <Feedback></Feedback>
  </Dialog>
    <Dialog header="Network Description" v-model:visible="showNetworkDescription" style="width: 50%" modal="yes">
          Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
      dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita
      kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur
      sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
      voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
      sanctus est Lorem ipsum dolor sit amet.
  </Dialog>
  <OverlayPanel header="Compare to saved configurations" ref="compareOverlay">
    <Compare @saveConfig="saveConfig($event)" :configurations="configurations" @compareTo="compareTo($event)"
    @load="load($event)" @deleteConfig="deleteConfig($event)"/>
  </OverlayPanel>

  <OverlayPanel ref="exportOverlay">
    <label> name: </label>
    <InputText type="text" v-model="SavePatientName" ></InputText>
    <Button label="save" @click="exportCSV()"/>
  </OverlayPanel>

</template>

<script>
import Feedback from "@/components/Header/Feedback";
import Compare from "@/components/Header/Compare";


export default {
  name: "Header",
  components: {
    Feedback,
    Compare
  },
  props: [
      "configurations", "NetworkName", "PatientName"
  ],
  data() {
    return {
      showFeedback: false,
      showNetworkDescription: false,
      SavePatientName: null,
      configLabel: "saved configurations",
      items: [
        {
          label: 'Reset',
          command: () => {
            this.reset()
          }
        },
        {
          label: 'Load Patient',
          command: (event) => {
            this.loadPatient(event.originalEvent)
          }
        },
        {
          label: 'Save Patient',
          command: (event) => {
            this.exportPatientOverlay(event.originalEvent)
          }
        },
        {
          label: 'Send Feedback',
          command: () => {
            this.showFeedback = true
          }
        },
        {
          label: 'Network Description',
          command: () => {
            this.showNetworkDescription = true
          }
        },
        {
          key: "configItem",
          label: "saved configurations",
          command: (event) => {
            this.$refs.compareOverlay.toggle(event.originalEvent)
          }
        },
        {
          label: 'back to network selection',
          command: () => {
            this.changePage()
          }
        }
      ]
    }
  },
  watch: {
    PatientName: function() {
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
      let configItem = this.items.find(a => a.key === "configItem")
      configItem.label = "comparing to " + name
      configItem.icon="pi pi-fw pi-times"
      configItem.command = () => {
        this.stopComparing()
      }
      this.$emit("compareTo", name)
      this.$refs.compareOverlay.toggle()
    },
    stopComparing() {
      let configItem = this.items.find(a => a.key === "configItem")
      configItem.label = "saved configurations"
      configItem.icon=""
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
      this.$refs.compareOverlay.toggle()
    },
    saveConfig(name) {
      this.$emit('saveConfig', name)
      this.$refs.compareOverlay.toggle()
    }
  }
}
</script>

<style scoped>



#name {
  color: grey;
}

</style>