<template>

  <Card style="height:100%">

    <template #title>
      {{ $t("Treatment") }}
      <Button icon="pi pi-question" class="p-button-text p-button-secondary p-button-rounded p-button-raised help" @click="$refs.op.toggle($event)"/>
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
          <h3 class="p-text-left">{{ $t("Interventions") }}:</h3>
          <TherapyInput
                        @addNodes="$emit('addNodes',$event)" @deleteNode="$emit('deleteNode',$event)"/>

          <div class="p-d-flex  p-jc-between p-ai-center">
            <h3 class="p-text-left">{{ $t("DecisionRatings") }}:</h3>
            <!--          <Button :label="$t('ShowMore')" @click="showLocal = true" ></Button>-->
          </div>
          <ProgressBar v-if="Store.optionsLoading" mode="indeterminate" style="height: .5em"/>
          <optionsTable @update="update($event)" />
          <!--    compare view  -->
          <div v-if="Store.selectedConfig">
            <h3> {{ Store.selectedConfig.name }}:</h3>
            <div class="p-mb-2">
             <div  v-for="o in Object.keys(Store.selectedConfig.config.options.selectedOption.option)" :key="o">
              {{Store.labels[o]}}: {{Store.selectedConfig.config.options.selectedOption.option[o]}}
            </div>
              </div>
             <div class="p-d-flex p-jc-center" v-for="goal in Object.keys(Store.selectedConfig.config.newGoals)" :field="goal" :header="goal" :key="goal">
                  <div class="p-mr-2">{{goal}}</div>
                  <div class="p-mr-2">
                    <bar :value="Store.selectedConfig.config.options.selectedOption.goalValues[String(goal)]" color="teal" width="200"
              v-tooltip="Store.selectedConfig.config.options.selectedOption.goalValues[String(goal)].toFixed(2)*100 + '%'"></bar>
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
import bar from "@/components/visualisations/bar";
import { useStore } from '@/store'

export default {
  name: "TherapyOptions",
  emits: ["update"],
  components: {
    TherapyInput,
    optionsTable,
    bar
  },
  setup() {
    const Store = useStore()
    return { Store }
  },
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