<template>

  <Card style="height:100%; position:relative">

    <template #title>
      {{ $t("Prediction") }}
      <Button icon="pi pi-question" class="p-button-outlined p-button-secondary p-button-rounded p-button-raised help"
              @click="$refs.op.toggle($event)"/>
      <OverlayPanel ref="op" style="width: 500px">
        {{ $t("TreatmentHelp") }}
      </OverlayPanel>
    </template>

    <template #content>

      <!-- decision table -->
      <div style="height:60%; border: solid 5px lightgray" class="p-b-2">
        <div v-if="!Store.error">
        <ProgressBar v-if="Store.optionsLoading" mode="indeterminate" style="height: .5em"/>
        <ScrollPanel class="h-full">
          <optionsTable id="optionsTable"/>
        </ScrollPanel>
          </div>
        <div v-else class="p-4">
          <b>Error in calculation! </b>
          <br>
          Please check if your evidence contains contradictions.
        </div>
      </div>

      <!-- phases -->
      <ScrollPanel style="height:40%">
        <Dropdown v-model="currentPhaseIndex" :options="phases" optionLabel="name" optionValue="index" id="PhaseSelect"
                  class="flex flex-align-full mt-4 " inputStyle="color:#4F46E5; font-weight: 700"/>
        <TabView v-model:active-index="currentPhaseIndex" scrollable>
          <TabPanel v-for="phase in Store.phases" :key="phase.name" :header="phase.name">
            <div class="text-left"><b>{{ $t("DesiredOutcomes") }}:</b></div>
            <div v-for="goal in Store.patient.goals" :key="goal.name">
              {{ Store.labels[goal.name] }} : {{ Store.option_labels[goal.name][goal.selected.name] }}
              <span class="text-color-secondary">
               ({{ Store.getDirection(goal.direction) }})
              </span>
              <span v-if="this.givenGoals_compare.find(a => a.name === goal.name)">
                ,<b> compare: - given:
                {{
                  Store.option_labels[goal.name][this.givenGoals_compare.find(a => a.name === goal.name).selected.name]
                }} </b>
                <span class="text-color-secondary">
                   ({{ Store.getDirection(this.givenGoals_compare.find(a => a.name === goal.name).direction) }})
                </span>
              </span>
            </div>
            <div v-for="goal in this.givenGoals" :key="goal.name">
              {{ Store.labels[goal.name] }} - <b> given:
              {{ Store.option_labels[goal.name][goal.selected.name] }} </b>
              <span class="text-color-secondary">
                ({{ Store.getDirection(goal.direction) }})
              </span>
              <span v-if="this.givenGoals_compare.find(a => a.name === goal.name)">
                ,<b> compare: - given:
                {{
                  Store.option_labels[goal.name][this.givenGoals_compare.find(a => a.name === goal.name).selected.name]
                }}
                <span class="text-color-secondary">
                  ({{ Store.getDirection(this.givenGoals_compare.find(a => a.name === goal.name).direction) }})
                </span>
              </b>
              </span>
            </div>


            <div class="text-left" v-if="Store.patient.targets.length > 0 || this.givenTargets.length > 0 ||
            this.givenTargets_compare.length > 0"><b>
              {{ $t("Interventions") }}:
            </b></div>
            <div v-for="target in Store.patient.targets" :key="target.name">
              {{ Store.labels[target.name] }}
            </div>
            <div v-for="target in this.givenTargets" :key="target.name">
              {{ Store.labels[target.name] }} - <b> given:
              {{ Store.option_labels[target.name][target.selected.name] }} </b>
            </div>
            <div v-for="target in this.givenTargets_compare" :key="target.name">
              compare: {{ Store.labels[target.name] }} - <b> given:
              {{ Store.option_labels[target.name][target.selected.name] }} </b>
            </div>
          </TabPanel>

          <TabPanel header="custom" v-bind:key="null">
            <!-- Desired Outcomes -->
            <div class="text-left"><b>{{ $t("DesiredOutcomes") }}:</b></div>
            <GoalInput title="Desired Outcomes" :changeable="true"
                       :hideHeader="true"
                       @addNodes="Store.addGoals($event)" @deleteNode="Store.deleteGoal($event)"/>

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
import optionsInput from "@/components/Prediction/options-input";
import optionsTable from "@/components/Prediction/options-table"
import GoalInput from "@/components/Prediction/goal-input";
import {useStore} from '@/store'

export default {
  name: "therapy-options",
  emits: ["update"],
  components: {
    optionsInput,
    optionsTable,
    GoalInput
  },
  setup() {
    const Store = useStore()
    return {Store}
  },
  data() {
    return {
      "showLocal": false,
      currentPhaseIndex: 0
    }
  },
  watch: {
    currentPhaseIndex() {
      if (this.currentPhaseIndex === this.Store.phases.length) {
        this.Store.currentPhase = null
      } else {
        this.Store.currentPhase = this.Store.phases[this.currentPhaseIndex]
        this.Store.phase_change()
      }
    },
    "Store.currentPhase": function () {
      if (this.Store.currentPhase === null) {
        this.currentPhaseIndex = this.Store.phases.length
      }
    }
  },
  computed: {
    givenGoals: function () {
      let givenGoals = []
      if (this.Store.currentPhase !== null) {
        let goals = this.Store.currentPhase.sets.goal
        goals.forEach(g => {
          let ev = this.Store.patient.evidence.find(e => e.name === g.name)
          if (ev) {
            givenGoals.push(ev)
          }
        })
      }
      return givenGoals
    },
    givenGoals_compare: function () {

      let givenGoals_compare = []
      if (this.Store.currentPhase !== null) {
        let goals = this.Store.currentPhase.sets.goal
        goals.forEach(g => {
          if (this.Store.compareConfig) {
            let ev = this.Store.compareConfig.patient.evidence.find(e => e.name === g.name)
            if (ev) {
              givenGoals_compare.push(ev)
            }
          }
        })
      }
      return givenGoals_compare
    },
    givenTargets: function () {
      let givenTargets = []
      if (this.Store.currentPhase !== null) {
        let targets = this.Store.currentPhase.sets.target
        targets.forEach(t => {
          let ev = this.Store.patient.evidence.find(e => e.name === t)
          if (ev) {
            givenTargets.push(ev)
          }
        })
      }

      return givenTargets
    },
    givenTargets_compare: function () {
      let givenTargets_compare = []
      if (this.Store.currentPhase !== null) {
        let targets = this.Store.currentPhase.sets.target
        targets.forEach(t => {

          if (this.Store.compareConfig) {
            let ev = this.Store.compareConfig.patient.evidence.find(e => e.name === t)
            if (ev) {
              givenTargets_compare.push(ev)
            }
          }
        })
      }

      return givenTargets_compare
    },
    phases: function () {
      let phases = []
      this.Store.phases.forEach((p, i) => phases.push({"name": p.name, "index": i}))
      phases.push({"name": "custom", "index": this.Store.phases.length})
      return phases;
    },
  },
  methods: {
    getGoalLabel(goal) {
      return this.Store.labels[goal.name] + ": " + goal.selected.name
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
  Display: None;
}

</style>