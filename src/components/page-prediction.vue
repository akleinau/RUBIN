<template>

  <Card style="height:100%; position:relative">

    <template #title>
      {{ $t("Prediction") }}
      <Button icon="pi pi-question" class="p-button-outlined p-button-secondary p-button-rounded p-button-raised help"
              @click="$refs.op.toggle($event)"/>
      <OverlayPanel ref="op" style="width: 500px"> {{ $t("TreatmentHelp") }}
        <h3>{{ $t("Interventions") }}</h3>
        {{ $t("InterventionsHelp") }}
        <h3>{{ $t("DecisionRatings") }}</h3>
        {{ $t("DecisionRatingHelp") }}
        <br><br>
        {{ $t("TreatmentChooseOne") }}
      </OverlayPanel>
    </template>

    <template #content>
      <ScrollPanel style="height:100%">

        <!-- decision table -->
        <div>
          <ProgressBar v-if="Store.optionsLoading" mode="indeterminate" style="height: .5em"/>
          <optionsTable style="border: solid 5px lightgray"/>
        </div>
        <br>

        <!-- phases -->
        <TabView v-model:active-index="currentPhaseIndex">
          <TabPanel v-for="phase in Store.phases" :key="phase.name" :header="phase.name">
            <h3 class="text-left">{{ $t("DesiredOutcomes") }}:</h3>
            <div v-for="goal in Store.patient.goals" :key="goal.name">
              {{ Store.labels[goal.name] }} : {{ Store.option_labels[goal.selected.name] }}
            </div>
            <div v-for="goal in this.givenGoals" :key="goal.name">
              {{Store.labels[goal.name]}} - <b> given: {{Store.option_labels[goal.selected.name]}} </b>
            </div>

            <h3 class="text-left">{{ $t("Interventions") }}:</h3>
            <div v-for="target in Store.patient.targets" :key="target.name">
              {{ Store.labels[target.name] }}
            </div>
            <div v-for="target in this.givenTargets" :key="target.name">
              {{Store.labels[target.name]}} - <b> given: {{Store.option_labels[target.selected.name]}} </b>
            </div>
          </TabPanel>

          <TabPanel header="custom" v-bind:key="null">
            <!-- Desired Outcomes -->
            <h3 class="text-left">{{ $t("DesiredOutcomes") }}:</h3>
            <GoalInput title="Desired Outcomes" :changeable="true"
                       :hideHeader="true"
                       :selection="Store.patient.goals"
                       @addNodes="Store.addGoals($event)" @deleteNode="Store.deleteGoal($event)"/>

            <!-- Intervention Input -->
            <div>
              <h3 class="text-left">{{ $t("Interventions") }}:</h3>
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
      currentPhaseIndex: 0,
      givenGoals: [],
      givenTargets: null,
    }
  },
  watch: {
    currentPhaseIndex() {
      if (this.currentPhaseIndex === this.Store.phases.length) {
        this.Store.currentPhase = null
      } else {
        this.Store.currentPhase = this.Store.phases[this.currentPhaseIndex]
        this.Store.phase_change()
        this.calculateGivenGoals(this.Store.currentPhase.sets.goal)
        this.calculateGivenTargets(this.Store.currentPhase.sets.target)
      }
    }
  },
  methods: {
    getGoalLabel(goal) {
      return this.Store.labels[goal.name] + ": " + goal.selected.name
    },
    calculateGivenGoals(goals) {
      this.givenGoals = []
      goals.forEach(g => {
        let ev = this.Store.patient.evidence.find(e => e.name === g.name)
        if (ev) {
          this.givenGoals.push(ev)
        }
      })
    },
    calculateGivenTargets(targets) {
      this.givenTargets = []
      targets.forEach(t => {
        let ev = this.Store.patient.evidence.find(e => e.name === t)
        if (ev) {
          this.givenTargets.push(ev)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.help {
  position: absolute;
  right: 5%
}

</style>