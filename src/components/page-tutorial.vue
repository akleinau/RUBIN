<template>
    <Dialog v-model:visible="stepIs0" class="tutorialCard shadow-5 m-0 " :header="$t('Tutorial1a')"
            :closable="false"
            id="overlay0" modal style="z-index: 2000;max-width:95%">
        <div class="flex align-items-center flex-column">
            <div class="flex align-items-center mb-2">
                <span class="mr-2"> {{ $t("Language") }}:</span>
                <Dropdown v-model="$i18n.locale" :options="$i18n.availableLocales" :key="`locale-${$i18n.locale}`"
                          :value="$i18n.locale" @change="languageChanged"/>
            </div>
            <div v-if="!liability && Store.network === 'endometrial cancer'" class="flex align-items-center flex-column">
                <Accordion>
                    <AccordionTab :header="$t('liability')">
                        <p>
                            <disclaimer-endorisk/>
                        </p>
                    </AccordionTab>
                </Accordion>
                <br>
                <div class="flex pt-1">
                    <Button class="p-button-text" :label="$t('reject')" icon="pi pi-times" @click="changePage()"/>
                    <Button class="p-button-text" :label="$t('accept')" icon="pi pi-check" @click="liability=true"/>
                </div>
            </div>
            <div v-else class="flex align-items-center flex-column">
                <span> {{ $t("Tutorial1b") }} </span>
                <span class="pt-1"> {{ $t("Tutorial1c") }} </span>
                <br>
                <div class="flex pt-1">
                    <Button class="p-button-text" :label="$t('start')" icon="pi pi-check" @click="start()"/>
                    <Button class="p-button-text" :label="$t('close')" icon="pi pi-times" @click="close()"/>
                </div>
            </div>
        </div>
    </Dialog>

    <Button v-show="step < finalStep && step > 0 " class=" p-1 m-2 absolute p-button-secondary "
            :label="$t('closeTutorial')" icon="pi pi-times"
            @click="close()" style="z-index: 10000; right:15%"/>

    <Card v-show="step === 1" class="absolute tutorialCard shadow-5 m-0 fadein animation-duration-300 " id="overlay_addButton" style="z-index: 20000">
        <template #content>
            <i class="pi pi-arrow-up mb-2"/>
            <br>
            <div class="flex align-items-center justify-content-center">
                <i class="pi pi-info-circle mr-2" style="font-size: 2rem"/>
                {{ $t("Tutorial2a") }}
            </div>

            <div class="border-circle mouse absolute centered" style="z-index: 20000; top:-45px;"> </div>

        </template>
    </Card>

    <div class="shadow-5" id="mouse_addButton">
      Hello!
    </div>

    <Card v-show="step === 2" class="absolute tutorialCard shadow-5 m-0 fadein animation-duration-300" id="overlay_evidenceOverlayTable"
          style="z-index: 20000">
        <template #content>
            <div class="flex align-items-center justify-content-center">
                <i class="pi pi-info-circle mr-2" style="font-size: 2rem"/>
                {{ $t("Tutorial2b") }}
            </div>
            <br>
            <i class="pi pi-arrow-down mb-2"/>
        </template>
    </Card>

    <Card v-show="step === 3" class="absolute tutorialCard shadow-5 m-0 fadein animation-duration-300" id="overlay_addOverlayEvidence"
          style="z-index: 20000">
        <template #content>
            <i class="pi pi-info-circle mt-2 mr-2" style="font-size: 1.5rem"/>
            {{ $t("Tutorial2c") }}
            <br>
            <i class="pi pi-arrow-down mb-2"/>
          <div class="border-circle mouse absolute centered" style="z-index: 20000; bottom:-55px;"> </div>
        </template>
    </Card>

    <Card v-show="step === 4" class="absolute tutorialCard shadow-5 m-0 fadein animation-duration-300" id="overlay_PhaseSelect" style="z-index: 5">
        <template #content>
            <div class="flex align-items-center justify-content-center">
                <i class="pi pi-info-circle mr-2" style="font-size: 2rem"/>
                <div>
                    <span v-if="Store.phases.length > 0"> {{ $t("Tutorial3b") }} </span>
                    <span v-else> {{ $t("Tutorial3c") }}</span>
                </div>
            </div>

            <br>
            <div class="relative">
              <Button v-if="PatientStore.goals.length > 0" class="p-button-text" :label="$t('next')"
                      @click="next()"/>
              <div class="border-circle mouse absolute centered" style="z-index: 20000; bottom:5px;"> </div>
            </div>
            <br>
            <i class="pi pi-arrow-down mb-2"/>
        </template>
    </Card>

    <Card v-show="step === 5" class="absolute tutorialCard shadow-5 m-0 fadein animation-duration-300" id="overlay_optionsTable"
          style="z-index: 20000">
        <template #content>
            <i class="pi pi-arrow-up mb-2"/>
            <br>
            <div class="flex align-items-center justify-content-center">
                <i class="pi pi-info-circle mr-2" style="font-size: 2rem"/>
                {{ $t("Tutorial3a") }}
            </div>
            <br>
            <div class="relative">
              <Button class="p-button-text" :label="$t('next')" @click="next()"/>
              <div class="border-circle mouse absolute centered" style="z-index: 20000; bottom:5px;"> </div>
            </div>
        </template>
    </Card>

    <Card v-show="step === 6" class="absolute tutorialCard shadow-5 m-0 fadein animation-duration-300" id="overlay_relevanceExplanation"
          style="z-index: 20000">
        <template #content>
            <i class="pi pi-arrow-up mb-2"/>
            <br>
            <div class="flex align-items-center justify-content-center">
                <i class="pi pi-info-circle mr-2" style="font-size: 2rem"/>
                {{ $t("Tutorial4a") }}
            </div>
            <br>
            <div class="relative">
              <Button class="p-button-text" :label="$t('next')" @click="next()"/>
              <div class="border-circle mouse absolute centered" style="z-index: 20000; bottom:5px;"> </div>
            </div>
        </template>
    </Card>

    <Card v-show="step === 7" class="absolute tutorialCard shadow-5 m-0 fadein animation-duration-300" id="overlay_explanationDropdown"
          style="z-index: 5">
        <template #content>
            <i class="pi pi-arrow-up mb-2"/>
            <br>
            <div class="flex align-items-center justify-content-center">
                <i class="pi pi-info-circle mr-2" style="font-size: 1.5rem"/>
                {{ $t("Tutorial4b") }}
            </div>
            <Button class="p-button-text" :label="$t('skip')" @click="Store.tutorialStep+=3;"/>
            <div class="border-circle mouse absolute centered" style="z-index: 20000; top:-40px;"> </div>
        </template>
    </Card>

    <Card v-show="step === 8" class="absolute tutorialCard shadow-5 m-0 fadein animation-duration-300" id="overlay_explanationDropdown2"
          style="z-index: 5">
        <template #content>
            <div class="flex align-items-center justify-content-center">
                <i class="pi pi-info-circle mr-2" style="font-size: 1.5rem"/>
                {{ $t("Tutorial4c") }}
            </div>
            <br>
            <i class="pi pi-arrow-down mb-2"/>
            <div class="border-circle mouse absolute centered" style="z-index: 20000; bottom:-70px;"> </div>
        </template>
    </Card>

    <Card v-show="step === 9" class="absolute tutorialCard shadow-5 m-0 fadein animation-duration-300" id="overlay_listExplanation" style="z-index: 5">
        <template #content>
            <i class="pi pi-arrow-up mb-2"/>
            <br>
            <div class="flex align-items-center justify-content-center">
                <i class="pi pi-info-circle mr-2" style="font-size: 2rem"/>
                {{ $t("Tutorial4d") }}
            </div>
            <br>
            <div class="relative">
              <Button class="p-button-text" :label="$t('next')" @click="next()"/>
              <div class="border-circle mouse absolute centered" style="z-index: 20000; bottom:5px;"> </div>
            </div>
        </template>
    </Card>

    <Card v-show="step === 10" class="absolute tutorialCard shadow-5 m-0 fadein animation-duration-300" id="overlay_menu" style="z-index: 20000">
        <template #content>
            <i class="pi pi-arrow-up mb-2"/>
            <br>
            <div class="flex align-items-center justify-content-center">
                <i class="pi pi-info-circle mr-2" style="font-size: 2rem"/>
                {{ $t("Tutorial5") }}
            </div>
            <br>
            <div class="relative">
              <Button class="p-button-text" :label="$t('next')" @click="next()"/>
              <div class="border-circle mouse absolute centered" style="z-index: 20000; bottom:5px;"> </div>
            </div>
        </template>
    </Card>

    <Dialog v-model:visible="stepIs11" class="tutorialCard shadow-5 m-0 fadein animation-duration-300 " :header="this.$t('Tutorial6a')"
            :closable="false"
            id="overlay_addButton1" modal style="z-index: 2000">
        <div class="flex align-items-center flex-column">
            <span> <b>{{ $t("Tutorial6b") }}</b> </span>
            <span class="p-2">{{ $t("Tutorial6c") }} </span>

            <div class="relative">
              <Button class="p-button-text pt-4" :label="this.$t('close')" icon="pi pi-times" @click="close()"/>
              <div class="border-circle mouse absolute centered" style="z-index: 20000; bottom:5px;"> </div>
            </div>
        </div>
    </Dialog>

</template>

<script  lang="ts">
import { defineComponent } from 'vue';
import {useStore} from '../store.ts';
import {usePatientStore} from "../stores/patient_store.ts";
import DisclaimerEndorisk from "../components/Header/diclaimer-endorisk.vue";

export default defineComponent({
    name: "page-tutorial",
    components: {DisclaimerEndorisk},
    props: ["loading"],
    emits: ["setBlock", "changePage"],
    data() {
        return {
            display: false as boolean,
            step: 0 as number,
            finalStep: 12 as number,
            liability: false as boolean,
        }
    },
    setup() {
        const Store = useStore()
        const PatientStore = usePatientStore()
        return {Store, PatientStore}
    },
    watch: {
        /**
         * updates tutorial when the step is changed elsewhere
         */
        tutorialStep: function () {
            this.sendBlock()
            this.setAllOverlayPositions()
        },
        /**
         * updates positions when all element of UI are loaded
         */
        loading: function () {
            this.setAllOverlayPositions()
        },
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

            // eslint-disable-next-line
            umami.track('button-startTutorial', {network: this.Store.network} );

        },
        close() {
            this.Store.tutorialStep = this.finalStep;
        },
        next() {
            this.Store.tutorialStep++;
        },
        /**
         * updates which elements of the UI are blocked during the tutorial
         *
         * @returns {Promise<void>}
         */
        async sendBlock() {
            let newBlock = {
                "evidence": !(this.tutorialStep <= 3 || this.Store.tutorialStep >= this.finalStep),
                "options": !(this.Store.tutorialStep >= 4 && this.Store.tutorialStep <= 5 || this.Store.tutorialStep >= this.finalStep),
                "explain": !(this.Store.tutorialStep >= 6 && this.Store.tutorialStep !== this.finalStep - 1),
            }

            if (this.Store.tutorialStep === 1 || this.Store.tutorialStep === 10) {
                window.scrollTo(0, 0);
            }


            this.$emit("setBlock", newBlock)

        },
        /**
         * sets positions of all tutorial overlays
         */
        setAllOverlayPositions() {
            setTimeout(() => {
                this.setOverlayPosition('addButton', 'overlay_addButton', "up")
                this.setOverlayPosition('evidenceOverlayTable', 'overlay_evidenceOverlayTable', "middle")
                this.setOverlayPosition('addOverlayEvidence', 'overlay_addOverlayEvidence', "down")
                this.setOverlayPosition('optionsTable', 'overlay_optionsTable', "up")
                this.setOverlayPosition('PhaseSelect', 'overlay_PhaseSelect', "down")
                this.setOverlayPosition('relevanceExplanation', 'overlay_relevanceExplanation', "fixed_low_up")
                this.setOverlayPosition('explanationDropdown', 'overlay_explanationDropdown', "up")
                this.setOverlayPosition('explanationDropdown', 'overlay_explanationDropdown2', "down")
                this.setOverlayPosition('listExplanation', 'overlay_listExplanation', "low_up")
                this.setOverlayPosition('menu', 'overlay_menu', "up")
                this.step = this.Store.tutorialStep
            }, 100)
        },

        /**
         * sets position of the specified tutorial overlay
         *
         * @param {string} target - the id of the target UI element to attach the overlay too
         * @param {string} overlay - the id of the overlay
         * @param {string} position - relative position of overlay to target
         */
        setOverlayPosition(target: string, overlay: string, position: string) {
          let target_object = document.getElementById(target) as HTMLElement | null
          let overlay_object = document.getElementById(overlay) as HTMLElement | null

          if (overlay_object != null) {
            if (target_object != null) {

                  let boundingBox = target_object.getBoundingClientRect()
                  overlay_object.style.width = boundingBox.width + "px";
                  overlay_object.style.left = boundingBox.left + document.body.scrollLeft + "px";

                  if (position === "up") {
                      overlay_object.style.top = boundingBox.bottom + window.scrollY + 5 + "px";
                  } else if (position === "middle") {
                      overlay_object.style.top = boundingBox.top + window.scrollY + "px";
                      overlay_object.style.transform = "translateY(-50%)";
                  } else if (position === "down") {
                      overlay_object.style.top = boundingBox.top + window.scrollY + "px";
                      overlay_object.style.transform = "translateY(-110%)";
                  } else if (position === "low_up") {
                      overlay_object.style.top = boundingBox.bottom + window.scrollY + 5 + "px";
                      overlay_object.style.transform = "translateY(-110%)";
                  } else if (position === "fixed_low_up") {
                      overlay_object.style.top = boundingBox.top + window.scrollY + 5 + "px";
                      overlay_object.style.transform = "translateY(300px)"; //fixed amount below top
                  }


              } else {
                  overlay_object.style.top = "0px"
                  overlay_object.style.left = "0px"
                  overlay_object.style.width = "200px"
            }
          }
        },
        languageChanged() {
            if (this.$i18n.locale == null) {
                this.$i18n.locale = "en"
            }
            this.Store.language = this.$i18n.locale
            this.Store.updateLabels()
        },
        changePage() {
            this.Store.reset(true)
            this.$emit("changePage")
        },
    }
})
</script>

<style lang="scss" scoped>

::v-deep(.p-card-body) {
  padding-bottom: 0 !important;
  padding-top: 0 !important;
}

.tutorialCard {
    background: #e5dbff;
    border: 3px dotted #4d026a;
}

.centered {
  margin:auto; left:0; right:0
}


/* The animation code */
@keyframes example {
  0%   {opacity: 0.2}
  50% {opacity: 0.8}
  100%   {opacity: 0.2}
}

.mouse {
  width:35px;
  height:35px;
  border: 9px double #e5dbff;
  animation-name: example;
  animation-duration: 3s;
  animation-iteration-count: infinite;
  pointer-events: none;
}

</style>