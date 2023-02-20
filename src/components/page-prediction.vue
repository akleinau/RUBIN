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
        <ProgressBar v-if="Store.optionsLoading" mode="indeterminate" style="height: .5em"/>
        <ScrollPanel class="h-full">
          <optionsTable/>
        </ScrollPanel>
      </div>

      <!-- phases -->
      <ScrollPanel style="height:40%">
        <TabView v-model:active-index="currentPhaseIndex" scrollable>
          <TabPanel v-for="phase in Store.phases" :key="phase.name" :header="phase.name">
            <div class="text-left"><b>{{ $t("DesiredOutcomes") }}:</b></div>
            <div v-for="goal in Store.patient.goals" :key="goal.name">
              ({{ Store.getDirection(goal.direction) }})
              {{ Store.labels[goal.name] }} : {{ Store.option_labels[goal.name][goal.selected.name] }}
              <span v-if="this.givenGoals_compare.find(a => a.name === goal.name)">
                ,<b> compare: - given:
                 ({{ Store.getDirection(this.givenGoals_compare.find(a => a.name === goal.name).direction) }})
                {{
                  Store.option_labels[goal.name][this.givenGoals_compare.find(a => a.name === goal.name).selected.name]
                }} </b>
              </span>
            </div>
            <div v-for="goal in this.givenGoals" :key="goal.name">
              {{ Store.labels[goal.name] }} - <b> given:
              ({{ Store.getDirection(goal.direction) }})
              {{ Store.option_labels[goal.name][goal.selected.name] }} </b>
              <span v-if="this.givenGoals_compare.find(a => a.name === goal.name)">
                ,<b> compare: - given:
                ({{ Store.getDirection(this.givenGoals_compare.find(a => a.name === goal.name).direction) }})
                {{
                  Store.option_labels[goal.name][this.givenGoals_compare.find(a => a.name === goal.name).selected.name]
                }} </b>
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
    }
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

</style>