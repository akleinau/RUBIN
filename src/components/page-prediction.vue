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
              {{ Store.labels[goal.name] }} : {{ goal.selected.name }}
            </div>
            <h3 class="text-left">{{ $t("Interventions") }}:</h3>
            <div v-for="target in Store.patient.targets" :key="target.name">
              {{ Store.labels[target.name] }}
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