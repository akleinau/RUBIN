<template>
  <Dialog v-model:visible="stepIs0" class="bg-blue-100 shadow-5 m-0 " header="Welcome!" :closable="false"
          id="overlay0" modal style="z-index: 2000">
    <div class="flex align-items-center flex-column">
      <span> Do you want to start the tutorial? </span>
      <br>
      <div class="flex pt-3">
        <Button class="p-button-text" label="start" icon="pi pi-check" @click="start()"/>
        <Button class="p-button-text" label="close" icon="pi pi-times" @click="close()"/>
      </div>
    </div>
  </Dialog>

  <Button v-show="step < finalStep && step > 0 " class=" p-1 m-2 absolute p-button-secondary "
          label="close tutorial" icon="pi pi-times"
          @click="close()" style="z-index: 10000; right:15%"/>

  <Card v-show="step === 1" class="absolute bg-blue-100 shadow-5 m-0" id="overlay1" style="z-index: 20000">
    <template #content>
      <Icon class="pi pi-arrow-up mb-2"/>
      <br>
      {{ $t("Tutorial2") }}
    </template>
  </Card>

  <Card v-show="step === 2" class="absolute bg-blue-100 shadow-5 m-0" id="overlay2" style="z-index: 20000">
    <template #content>
      Select some evidence!
      <br>
      <Icon class="pi pi-arrow-down mb-2"/>
    </template>
  </Card>

  <Card v-show="step === 3" class="absolute bg-blue-100 shadow-5 m-0" id="overlay3" style="z-index: 20000">
    <template #content>
      <Icon class="pi pi-arrow-up mb-2"/>
      <br>
      Click to add!
    </template>
  </Card>

  <Card v-show="step === 4" class="absolute bg-blue-100 shadow-5 m-0" id="overlay4" style="z-index: 20000">
    <template #content>
      <Icon class="pi pi-arrow-up mb-2"/>
      <br>
      {{ $t("Tutorial3a") }}
      <br>
      <Button class="p-button-text" label="next" @click="next()"/>
    </template>
  </Card>

  <Card v-show="step === 5" class="absolute bg-blue-100 shadow-5 m-0" id="overlay5" style="z-index: 20000">
    <template #content>
      {{ $t("Tutorial3b") }}
      <br>
      <Button class="p-button-text" label="next" @click="next()"/>
      <br>
      <Icon class="pi pi-arrow-down mb-2"/>
    </template>
  </Card>

  <Card v-show="step === 6" class="absolute bg-blue-100 shadow-5 m-0" id="overlay6" style="z-index: 20000">
    <template #content>
      <Icon class="pi pi-arrow-up mb-2"/>
      <br>
      Here you can see the relevance and influence of each evidence for the prediction.
      <br>
      <Button class="p-button-text" label="next" @click="next()"/>
    </template>
  </Card>

  <Card v-show="step === 7" class="absolute bg-blue-100 shadow-5 m-0" id="overlay7" style="z-index: 5">
    <template #content>
      <Icon class="pi pi-arrow-up mb-2"/>
      <br>
      Click here to view another explanation.
    </template>
  </Card>

  <Card v-show="step === 8" class="absolute bg-blue-100 shadow-5 m-0" id="overlay8" style="z-index: 5">
    <template #content>
      Select "All predictions"
      <br>
      <Icon class="pi pi-arrow-down mb-2"/>
    </template>
  </Card>

  <Card v-show="step === 9" class="absolute bg-blue-100 shadow-5 m-0" id="overlay9" style="z-index: 5">
    <template #content>
      <Icon class="pi pi-arrow-up mb-2"/>
      <br>
      Here you can see all predictions of the model with their likelihoods.
      <br>
      <Button class="p-button-text" label="next" @click="next()"/>
    </template>
  </Card>

  <Card v-show="step === 10" class="absolute bg-blue-100 shadow-5 m-0" id="overlay10" style="z-index: 20000">
    <template #content>
      <Icon class="pi pi-arrow-up mb-2"/>
      <br>
      Use the menu to compare patients, export pdf files or receive help.
      <br>
      <Button class="p-button-text" label="next" @click="next()"/>
    </template>
  </Card>

    <Dialog v-model:visible="stepIs11" class="bg-blue-100 shadow-5 m-0 " header="Congrats!" :closable="false"
          id="overlay11" modal style="z-index: 2000">
    <div class="flex align-items-center flex-column">
      <span> <b>You finished the tutorial!</b> </span>
      <span class="p-2"> If you have further questions, click on the question marks on top of each view.</span>
        <Button class="p-button-text pt-4" label="close" icon="pi pi-times" @click="close()"/>
    </div>
  </Dialog>

</template>

<script>
import {useStore} from '@/store'

export default {
  name: "page-tutorial",
  props: ["loading"],
  emits: ["setBlock"],
  data() {
    return {
      display: false,
      step: 0,
      finalStep: 12
    }
  },
  setup() {
    const Store = useStore()
    return {Store}
  },
  watch: {
    tutorialStep: function () {
      this.sendBlock()
      this.setAllOverlayPositions()


    },
    loading: function () {
      this.setAllOverlayPositions()
    }
  },
  computed: {
    tutorialStep: function () {
      return this.Store.tutorialStep
    },
    stepIs0: function () {
      return this.Store.tutorialStep === 0
    },
    stepIs11: function () {
      return this.Store.tutorialStep === 11
    },
  },
  methods: {
    start() {
      this.Store.tutorialStep = 1

    },
    close() {
      this.Store.tutorialStep = this.finalStep;
    },
    next() {
      this.Store.tutorialStep++;
    },
    async sendBlock() {
      let newBlock = {
        "evidence": !(this.tutorialStep <= 3 || this.Store.tutorialStep >= this.finalStep),
        "options": !(this.Store.tutorialStep >= 4 && this.Store.tutorialStep <= 5 || this.Store.tutorialStep >= this.finalStep),
        "explain": !(this.Store.tutorialStep >= 6 && this.Store.tutorialStep !== this.finalStep - 1),
      }

      if (this.Store.tutorialStep === 1 || this.Store.tutorialStep === this.finalStep) {
        window.scrollTo(0, 0);
      }


      this.$emit("setBlock", newBlock)

    },
    setAllOverlayPositions() {
      setTimeout(() => {
        this.setOverlayPosition('addButton', 'overlay1', "up")
        this.setOverlayPosition('evidenceOverlayTable', 'overlay2', "middle")
        this.setOverlayPosition('addOverlayEvidence', 'overlay3', "up")
        this.setOverlayPosition('optionsTable', 'overlay4', "up")
        this.setOverlayPosition('PhaseSelect', 'overlay5', "down")
        this.setOverlayPosition('relevanceExplanation', 'overlay6', "low_up")
        this.setOverlayPosition('explanationDropdown', 'overlay7', "up")
        this.setOverlayPosition('explanationDropdown', 'overlay8', "down")
        this.setOverlayPosition('listExplanation', 'overlay9', "low_up")
        this.setOverlayPosition('menu', 'overlay10', "up")
        this.step = this.Store.tutorialStep
      }, 100)
    },

    setOverlayPosition(target, overlay, position) {
      if (document.getElementById(target)) {
        let boundingBox = document.getElementById(target).getBoundingClientRect()
        document.getElementById(overlay).style.width = boundingBox.width + "px";
        document.getElementById(overlay).style.left = boundingBox.left + document.body.scrollLeft + "px";

        if (position === "up") {
          document.getElementById(overlay).style.top = boundingBox.bottom + window.scrollY + 5 + "px";
        } else if (position === "middle") {
          document.getElementById(overlay).style.top = boundingBox.top + window.scrollY + "px";
          document.getElementById(overlay).style.transform = "translateY(-50%)";
        } else if (position === "down") {
          document.getElementById(overlay).style.top = boundingBox.top + window.scrollY + "px";
          document.getElementById(overlay).style.transform = "translateY(-110%)";
        } else if (position === "low_up") {
          document.getElementById(overlay).style.top = boundingBox.bottom + window.scrollY + 5 + "px";
          document.getElementById(overlay).style.transform = "translateY(-110%)";
        }

      } else {
        document.getElementById(overlay).style.top = "0px"
        document.getElementById(overlay).style.left = "0px"
        document.getElementById(overlay).style.width = "200px"
      }
    }
  }
}
</script>

<style lang="scss" scoped>

::v-deep(.p-card-body) {
  padding: 0.3rem;
}

</style>