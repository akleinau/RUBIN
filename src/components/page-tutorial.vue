<template>
  <Card v-show="step === 1" class="absolute bg-blue-100 shadow-5 m-0" id="overlay1" style="z-index: 2000">
    <template #content>
      <Icon class="pi pi-arrow-up mb-2"/>
      <br>
      {{ $t("Tutorial2") }}
    </template>
  </Card>

  <Card v-show="step === 2" class="absolute bg-blue-100 shadow-5 m-0" id="overlay2" style="z-index: 2000">
    <template #content>
      Select some evidence!
      <br>

      <Icon class="pi pi-arrow-down mb-2"/>
    </template>
  </Card>

  <Card v-show="step === 3" class="absolute bg-blue-100 shadow-5 m-0" id="overlay3" style="z-index: 2000">
    <template #content>
      <Icon class="pi pi-arrow-up mb-2"/>
      <br>
      Click to add!
    </template>
  </Card>

  <Card v-show="step === 4" class="absolute bg-blue-100 shadow-5 m-0" id="overlay4" style="z-index: 2000">
    <template #content>
      <Icon class="pi pi-arrow-up mb-2"/>
      <br>
      {{ $t("Tutorial3a") }}
      {{ $t("Tutorial3b") }}
      <br>
      <Button class="p-button-text" label="next" @click="next()"/>
    </template>
  </Card>

  <Card v-show="step === 5" class="absolute bg-blue-100 shadow-5 m-0" id="overlay5" style="z-index: 2000">
    <template #content>
      <Icon class="pi pi-arrow-up mb-2"/>
      <br>
      {{ $t("Tutorial4") }}
      <br>
      <Button class="p-button-text" label="next" @click="next()"/>
    </template>
  </Card>

  <Card v-show="step === 6" class="absolute bg-blue-100 shadow-5 m-0" id="overlay6" style="z-index: 2000">
    <template #content>
      <Icon class="pi pi-arrow-up mb-2"/>
      <br>
      Here you can select other explanations.
    </template>
  </Card>

  <Card v-show="step === 8" class="absolute bg-blue-100 shadow-5 m-0" id="overlay8" style="z-index: 2000">
    <template #content>
      <Icon class="pi pi-arrow-up mb-2"/>
      <br>
      Use the menu to compare patients, export pdf files or receive help!
      <br>
      Congrats, you finished the tutorial!
      <br>
      <Button class="p-button-text" label="close" @click="close()"/>
    </template>
  </Card>
</template>

<script>
import {useStore} from '@/store'

export default {
  name: "page-tutorial",
  emits: ["setBlock"],
  data() {
    return {
      display: false,
      step: 0
    }
  },
  setup() {
    const Store = useStore()
    return {Store}
  },
  mounted() {
    this.start()
  },
  watch: {
    showTutorial: function () {
      if (this.Store.showTutorial === true) {
        this.start()
        console.log("tutorial started")
      }
    },
    tutorialStep: function () {
      this.sendBlock()
      setTimeout(() => {
        this.setOverlayPosition('addButton', 'overlay1', "up")
        this.setOverlayPosition('evidenceOverlayTable', 'overlay2', "down")
        this.setOverlayPosition('addOverlayEvidence', 'overlay3', "up")
        this.setOverlayPosition('optionsTable', 'overlay4', "up")
        this.setOverlayPosition('relevanceExplanation', 'overlay5', "up")
        this.setOverlayPosition('explanationDropdown', 'overlay6', "up")
        this.setOverlayPosition('menu', 'overlay8', "up")
        this.step = this.Store.tutorialStep
      }, 100)

    }
  },
  computed: {
    showTutorial: function () {
      return this.Store.showTutorial
    },
    tutorialStep: function () {
      return this.Store.tutorialStep
    }
  },
  methods: {
    start() {
      this.display = true //makes sure dialog is rendered on top of interface
      this.Store.tutorialStep = 1
      this.sendBlock()
    },
    close() {
      this.Store.tutorialStep = 9;
      this.sendBlock()
    },

    prev() {
      this.Store.tutorialStep === 1 ? this.Store.tutorialStep = 3 : this.Store.tutorialStep--;
      this.sendBlock()

    },
    next() {
      this.Store.tutorialStep++;
      this.sendBlock()

    },
    async sendBlock() {
      let newBlock = {
        "evidence": !(this.tutorialStep <= 3 || this.Store.tutorialStep > 8),
        "options": !(this.Store.tutorialStep === 4 || this.Store.tutorialStep > 8),
        "explain": !(this.Store.tutorialStep >= 5 && this.Store.tutorialStep !== 8),
      }
      this.$emit("setBlock", newBlock)

    },
    setOverlayPosition(target, overlay, position) {
      if (document.getElementById(target)) {
        let boundingBox = document.getElementById(target).getBoundingClientRect()
        document.getElementById(overlay).style.width = boundingBox.width + "px";
        document.getElementById(overlay).style.left = boundingBox.left + "px";

        if (position === "up") {
          document.getElementById(overlay).style.top = boundingBox.bottom + 5 + "px";
        } else if (position==="down") {
          let height = document.getElementById(overlay).getBoundingClientRect().height
          document.getElementById(overlay).style.top = boundingBox.top - height + "px";
        }

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