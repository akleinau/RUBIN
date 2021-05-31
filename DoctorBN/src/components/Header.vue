<template>
  <Menubar :model="items" ref="menu"/>
  <div id="logo">DoctorBN</div>
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
  <Dialog header="Compare to saved configurations" v-model:visible="showConfigs" style="width: 50%" modal="yes">
    <Compare />
  </Dialog>

  <OverlayPanel ref="exportOverlay">
    <label> name: </label>
    <InputText type="text" v-model="patientName"></InputText>
    <Button label="save" @click="exportCSV()"/>
  </OverlayPanel>

</template>

<script>
import Feedback from "@/components/additional/Feedback";
import Compare from "@/components/additional/Compare";


export default {
  name: "Header",
  components: {
    Feedback,
    Compare
  },
  data() {
    return {
      showFeedback: false,
      showNetworkDescription: false,
      showConfigs: false,
      patientName: null,
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
          label: 'Settings',
          items: [{label: 'change theme'}, {label: 'change language'}]
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
          label: 'saved configurations',
          command: () => {
            this.showConfigs = true
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
      this.$emit('exportCSV', this.patientName)
      this.$refs.exportOverlay.toggle()
    },
  }
}
</script>

<style scoped>

#logo {
  position: absolute;
  top: 1%;
  left: 90%;
  font-size: 2em;
  color: teal
}

</style>