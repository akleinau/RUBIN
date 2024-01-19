<template>

  <Card style="height:100%; position:relative">

    <template #title>
      {{ $t("Prediction") }}
      <Button icon="pi pi-question" class="p-button-outlined p-button-secondary p-button-rounded p-button-raised help"
              @click="$refs.op.toggle($event)"/>
      <OverlayPanel ref="op" style="width: 400px">
        {{ $t("TreatmentHelp") }}
      </OverlayPanel>
    </template>

    <template #content>

      <!-- decision table -->
      <div style="height:60%; border: solid 5px lightgray" class="p-b-2 overlap-hidden">
        <ScrollPanel class="h-full overlap-hidden">
          <div v-if="!Store.error">
            <ProgressBar v-if="Store.optionsLoading" mode="indeterminate" style="height: .5em"/>
            <PredictionsTable id="optionsTable" class="h-full overlap-hidden"/>
          </div>
          <div v-else class="p-4">
            <b>{{ $t("CalculationError1") }} </b>
            <br>
            {{ $t("CalculationError2") }}
          </div>
        </ScrollPanel>
      </div>

      <!-- phases -->
      <ScrollPanel style="height:40%">
        <Dropdown v-model="currentPhaseIndex" :options="phases" optionLabel="label" optionValue="index" id="PhaseSelect"
                  class="flex flex-align-full mt-4 "/>
        <div class="w-full mt-2 p-1 bg-yellow-100" v-if="this.Store.network === 'endometrial cancer' & currentPhaseIndex !== 0">
            <i class="pi pi-exclamation-circle"/>
            {{$t("NotValidatedWarning")}}
        </div>
        <TabView v-model:active-index="currentPhaseIndex" scrollable class="text-left">
          <!-- predefined phases -->
          <TabPanel v-for="phase in Store.phases" :key="phase.name" :header="phase.name">
              <DefinedPhases/>
          </TabPanel>
          
          <!-- custom phase -->
          <TabPanel header="custom" v-bind:key="null">
            <!-- Desired Outcomes -->
            <div class="text-left"><b>{{ $t("DesiredOutcomes") }}:</b></div>
            <GoalInput/>

            <!-- Intervention Input -->
            <div>
              <br>
              <div class="text-left"><b>{{ $t("Interventions") }}:</b></div>
              <optionsInput/>

            </div>
          </TabPanel>
        </TabView>
      </ScrollPanel>
    </template>
  </Card>

</template>

<script>
import optionsInput from "@/components/Prediction/options-input.vue";
import PredictionsTable from "@/components/Prediction/predictions-table.vue"
import GoalInput from "@/components/Prediction/goal-input.vue";
import DefinedPhases from "@/components/Prediction/defined-phases.vue";
import {useStore} from '@/store'

export default {
  name: "page-prediction",
  emits: ["update"],
  components: {
    optionsInput,
    PredictionsTable,
    GoalInput,
    DefinedPhases
  },
  setup() {
    const Store = useStore()
    return {Store}
  },
  data() {
    return {
      "showLocal": false,
      currentPhaseIndex: 0,
    }
  },
  watch: {
      /**
       * triggers phase change if the currentPhaseIndex changes
       */
    currentPhaseIndex() {
      if (this.currentPhaseIndex === this.Store.phases.length) {
        this.Store.currentPhase = null
      } else {
        this.Store.currentPhase = this.Store.phases[this.currentPhaseIndex]
        this.Store.phase_change()
      }
      // eslint-disable-next-line
      umami.track('button-phase-change', {phase: this.currentPhaseIndex, network: this.Store.network} );
    }
  },
  computed: {
      /**
       * computes list of phases for phase dropdown
       *
       * @returns {*[]}
       */
    phases: function () {
      let phases = []
      this.Store.phases.forEach((p, i) => {
        //find label based on language
        let label = p.name
        if (p.labels[this.Store.language]) {
          label = p.labels[this.Store.language]
        }
        else if (p.labels["standard"]) {
          label = p.labels["standard"]
        }

        phases.push({"name": p.name, "label": label, "index": i})
      })
      phases.push({"name": "custom", "label": this.$t("custom"), "index": this.Store.phases.length})
      return phases;
    },
  },
  methods: {
      /**
       * returns goal label
       *
       * @param goal
       * @returns {string}
       */
    getGoalLabel(goal) {
      return this.Store.labels.nodes[goal.name] + ": " + goal.selected.name
    },
  }
}
</script>

<style lang="scss" scoped>
.help {
  position: absolute;
  right: 5%
}

::v-deep(.p-tabview-nav-container) {
  display: None;
}

::v-deep(.p-dropdown-label) {
  color:#4F46E5;
  font-weight: 700
}


</style>