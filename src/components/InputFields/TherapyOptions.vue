<template>

  <Card style="height:100%">

    <template #title>
      {{ $t("Treatment") }}
      <Button icon="pi pi-question" class="p-button-text p-button-secondary help" @click="$refs.op.toggle($event)"/>
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
        <div>

          <likelyTable :results="likelyResult" :goals="goals" :labels="labels"
                       @update="update($event)" :selectedOption="selectedOption"></likelyTable>

          <h3 class="p-text-left">{{ $t("Interventions") }}:</h3>
          <TherapyInput :nodes="nodes" :selection="targets" :compareConfig="compareConfig" :labels="labels"
                        @addNodes="$emit('addNodes',$event)" @deleteNode="$emit('deleteNode',$event)"/>

          <div class="p-d-flex  p-jc-between p-ai-center">
            <h3 class="p-text-left">{{ $t("DecisionRatings") }}:</h3>
            <!--          <Button :label="$t('ShowMore')" @click="showLocal = true" ></Button>-->
          </div>
          <ProgressBar v-if="loading" mode="indeterminate" style="height: .5em"/>
          <optionsTable :results="results" :goals="goals" :labels="labels"
                        @update="update($event)" :selectedOption="selectedOption"/>
          <div v-if="compareConfig">
            <h3> {{ compareConfig.name }}:</h3>
            <div class="p-mb-2">
             <div  v-for="o in Object.keys(compareConfig.config.options.selectedOption.option)" :key="o">
              {{labels[o]}}: {{compareConfig.config.options.selectedOption.option[o]}}
            </div>
              </div>
             <div class="p-d-flex p-jc-center" v-for="goal in Object.keys(compareConfig.config.newGoals)" :field="goal" :header="goal" :key="goal">
                  <div class="p-mr-2">{{goal}}</div>
                  <div class="p-mr-2">
                    <bar :value="compareConfig.config.options.selectedOption.goalValues[String(goal)]" color="teal" width="200"
              v-tooltip="compareConfig.config.options.selectedOption.goalValues[String(goal)].toFixed(2)*100 + '%'"></bar>
                  </div>
            </div>
          </div>
        </div>
      </ScrollPanel>
    </template>
  </Card>

</template>

<script>
import TherapyInput from "@/components/InputFields/TherapyInput";
import optionsTable from "@/components/InputFields/optionsTable"
import likelyTable from "@/components/InputFields/likelyTable";
import bar from "@/components/visualisations/bar";

export default {
  name: "TherapyOptions",
  emits: ["update"],
  components: {
    TherapyInput,
    optionsTable,
    likelyTable,
    bar
  },
  props: [
    "results",
    "likelyResult",
    "goals",
    "nodes",
    "targets",
    "selectedOption",
    "loading",
    "compareConfig",
    "labels"
  ],
  data() {
    return {
      "showLocal": false
    }
  },
  methods: {
    update(name) {
      this.$emit("update", name);
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