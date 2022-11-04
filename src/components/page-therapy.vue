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
        <!-- prediction results
        <div class="col b-2" v-if="Store.options.options.length===0">
          <div v-for="goal in getGoalForSummary()" :key="goal" style="fontSize: 2rem">{{ goal }}</div>
        </div>
        -->

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
            <NodeInput v-if="Store.selectedConfig == null" title="Desired Outcomes" :changeable="true"
                       :hideHeader="true"
                       :selection="Store.patient.goals"
                       @addNodes="Store.addGoals($event)" @deleteNode="Store.deleteGoal($event)"/>
            <div v-else>
              <NodeInputCompare title="Desired Outcomes" :name2="Store.selectedConfig.name"
                                :selection="Store.patient.goals"
                                :selection2="Store.selectedConfig.config.patient.goals" :changeable="false"/>
            </div>

            <!-- Intervention Input -->
            <div>
              <h3 class="text-left">{{ $t("Interventions") }}:</h3>
              <TherapyInput/>

              <!--<div class="flex  justify-content-between align-center">
                <h3 class="text-left">{{ $t("DecisionRatings") }}:</h3>
                          <Button :label="$t('ShowMore')" @click="showLocal = true" ></Button>
              </div> -->

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
                       v-for="goal in Object.keys(Store.selectedConfig.config.newGoals)"
                       :field="goal" :header="goal" :key="goal">
                    <div class="r-2">{{ goal }}</div>
                    <div class="r-2">
                      <bar :value="Store.selectedConfig.config.options.selectedOption.goalValues[String(goal)]"
                           color="teal"
                           width="200"
                           v-tooltip="Store.selectedConfig.config.options.selectedOption.goalValues[String(goal)].toFixed(2)*100 + '%'"></bar>
                    </div>
                  </div>
                </div>
              </div>
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
import NodeInput from "@/components/InputFields/node-input";
import NodeInputCompare from "@/components/InputFields/node-input-compare";
import {useStore} from '@/store'

export default {
  name: "therapy-options",
  emits: ["update"],
  components: {
    TherapyInput,
    optionsTable,
    bar,
    NodeInput,
    NodeInputCompare
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
  methods: {
    getGoalForSummary() {
      if (this.Store.newGoals != null && this.Store.options.selectedOption != null) {
        let goalnames = []
        Object.keys(this.Store.newGoals).forEach(goal => {
          let percentage = this.Store.options.selectedOption.goalValues[goal] * 100
          goalnames.push(this.Store.labels[goal] + " - " + this.Store.newGoals[goal] + ": " +
              percentage.toFixed(0) + "%")
        })
        return goalnames
      }
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