<template>
  <!-- Phase Desired Outcomes-->
  <div class="text-left"><b>{{ $t("DesiredOutcomes") }}:</b></div>
  <div v-for="goal in Store.patient.goals" :key="goal.name">
    {{ Store.labels.nodes[goal.name] }} : {{ Store.labels.states[goal.name][goal.selected.name] }}
    <span class="text-color-secondary">
       ({{ $t(goal.direction) }})
    </span>
    <span v-if="this.givenGoals_compare.find(a => a.name === goal.name)">
      ,<b> {{ $t("compare") }}: - {{ $t("given") }}:
      {{Store.labels.states[goal.name][this.givenGoals_compare.find(a => a.name === goal.name).selected.name] }} </b>
      <span class="text-color-secondary">
                   ({{ $t(this.givenGoals_compare.find(a => a.name === goal.name).direction) }})
      </span>
    </span>
  </div>

  <div v-for="goal in this.givenGoals" :key="goal.name">
    {{ Store.labels.nodes[goal.name] }} - <b> {{ $t("given") }}:
    {{ Store.labels.states[goal.name][goal.selected.name] }} </b>
    <span class="text-color-secondary">
        ({{ $t(goal.direction) }})
    </span>
    <span v-if="this.givenGoals_compare.find(a => a.name === goal.name)">
      ,<b> {{ $t("compare") }}: - {{ $t("given") }}:
      {{Store.labels.states[goal.name][this.givenGoals_compare.find(a => a.name === goal.name).selected.name]}}
      <span class="text-color-secondary">
                  ({{ $t(this.givenGoals_compare.find(a => a.name === goal.name).direction) }})
      </span>
    </b>
    </span>
  </div>

  <!-- Phase Interventions-->
  <div class="text-left pt-4" v-if="Store.patient.targets.length > 0 || this.givenTargets.length > 0 ||
            this.givenTargets_compare.length > 0"><b>
    {{ $t("Interventions") }}:
  </b></div>
  <div v-for="target in Store.patient.targets" :key="target.name">
    {{ Store.labels.nodes[target.name] }}
  </div>
  <div v-for="target in this.givenTargets" :key="target.name">
    {{ Store.labels.nodes[target.name] }} - <b> {{ $t("given") }}:
    {{ Store.labels.states[target.name][target.selected.name] }} </b>
  </div>
  <div v-for="target in this.givenTargets_compare" :key="target.name">
    {{ $t("compare") }}: {{ Store.labels.nodes[target.name] }} - <b> {{ $t("given") }}:
    {{ Store.labels.states[target.name][target.selected.name] }} </b>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {useStore} from '../../store.ts';
import {NGoal, NNode, NEvidence, NTarget} from "../../types/node_types.ts";

export default defineComponent({
  name: "defined-phases",
  setup() {
    const Store = useStore()
    return {Store}
  },
  computed: {
    /**
     * returns goals that are predefined by the current phase but already entered as evidence
     *
     * @returns {Object[]}
     */
    givenGoals: function () : NEvidence[] {
      let givenGoals: NEvidence[] = []
      if (this.Store.currentPhase !== null) {
        let goals = this.Store.currentPhase.sets.goal
        goals.forEach((g: NGoal) => {
          let ev = this.Store.patient.evidence.find((e: NEvidence) => e.name === g.name)
          if (ev) {
            givenGoals.push(ev)
          }
        })
      }
      return givenGoals
    },

    /**
     * returns goals that are predefined by the current phase but already entered as evidence of the compare config
     *
     * @returns {Object[]}
     */
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

    /**
     * returns targets that are predefined by the current phase but already entered as evidence
     *
     * @returns {Object[]}
     */
    givenTargets: function () : NEvidence[] {
      let givenTargets: NEvidence[] = []
      if (this.Store.currentPhase !== null) {
        let targets = this.Store.currentPhase.sets.target
        targets.forEach((t: NTarget) => {
          let ev = this.Store.patient.evidence.find((e: NEvidence) => e.name === t)
          if (ev) {
            givenTargets.push(ev)
          }
        })
      }

      return givenTargets
    },

    /**
     * returns targets that are predefined by the current phase but already entered as evidence of the compare config
     *
     * @returns {Object[]}
     */
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
  }
})
</script>

<style scoped>

</style>