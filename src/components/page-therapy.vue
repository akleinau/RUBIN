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

        <!--    compare view  -->
        <div v-if="Store.selectedConfig">
          <h3> {{ Store.selectedConfig.name }}:</h3>
          <div v-if="Store.selectedConfig.config.options.selectedOption">
            <div class="b-2">
              <div v-for="o in Object.keys(Store.selectedConfig.config.options.selectedOption.option)" :key="o">
                {{ Store.labels[o] }}: {{ Store.selectedConfig.config.options.selectedOption.option[o] }}
              </div>
            </div>
            <div class="flex justify-content-center"
                 v-for="goal in Store.patient.goals"
                 :field="goal" :header="goal" :key="goal.name">
              <div class="r-2">{{ getGoalLabel(goal) }}</div>
              <div class="r-2">
                <bar :value="Store.selectedConfig.config.options.selectedOption.goalValues[String(goal.name)]"
                     color="teal"
                     width="200"
                     v-tooltip="Store.selectedConfig.config.options.selectedOption.goalValues[String(goal.name)].toFixed(2)*100 + '%'"></bar>
              </div>
            </div>
          </div>
        </div>
        <br>

        <!-- decision table -->
        <div>
          <ProgressBar v-if="Store.optionsLoading" mode="indeterminate" style="height: .5em"/>
          <optionsTable/>
        </div>

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
              <TherapyInput/>

            </div>
          </TabPanel>
        </TabView>

      </ScrollPanel>
    </template>
  </Card>

</template>

<script>
import TherapyInput from "@/components/Therapy/therapy-input";
import optionsTable from "@/components/Therapy/options-table"
import bar from "@/components/visualisations/bar-vis";
import GoalInput from "@/components/InputFields/goal-input";
import {useStore} from '@/store'

export default {
  name: "therapy-options",
  emits: ["update"],
  components: {
    TherapyInput,
    optionsTable,
    bar,
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