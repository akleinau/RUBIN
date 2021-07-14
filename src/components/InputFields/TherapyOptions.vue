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
          <optionsTable :results="results" :goals="goals" showLocal="true" :labels="labels"
                        @update="update($event)" :selectedOption="selectedOption"></optionsTable>
          <div v-if="compareConfig">
            <h3> {{ compareConfig.name }}:</h3>
            <optionsTable :results="compareConfig.config.options.options" :labels="labels"
                          :goals="compareConfig.config.newGoals" @update="update($event)"
                          :selectedOption="selectedOption"/>
          </div>
        </div>
      </ScrollPanel>

      <Dialog :header="$t('localRelevance')" v-model:visible="showLocal"
              style="width:90%; height:90%; background-color:white"
              :modal="true">
        <optionsTable :results="results" :goals="goals" showLocal="true" :labels="labels"
                      @update="update($event)" :selectedOption="selectedOption"></optionsTable>
        <div v-if="compareConfig">
          <h3> {{ compareConfig.name }}:</h3>
          <optionsTable :results="compareConfig.config.options.options" showLocal="true" :labels="labels"
                        :goals="compareConfig.config.newGoals" @update="update($event)"
                        :selectedOption="selectedOption"/>
        </div>
      </Dialog>

    </template>
  </Card>

</template>

<script>
import TherapyInput from "@/components/InputFields/TherapyInput";
import optionsTable from "@/components/InputFields/optionsTable"
import likelyTable from "@/components/InputFields/likelyTable";

export default {
  name: "TherapyOptions",
  emits: ["update"],
  components: {
    TherapyInput,
    optionsTable,
    likelyTable
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