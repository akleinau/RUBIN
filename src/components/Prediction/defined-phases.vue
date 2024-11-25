<template>
  <!-- Phase Desired Outcomes-->
  <div class="text-left"><b>{{ $t("DesiredOutcomes") }}:</b></div>
  <div v-for="goal in PatientStore.goals" :key="goal.name">
    {{ Store.labels.nodes[goal.name] }} : {{ Store.labels.states[goal.name][goal.selected.name] }}
    <span class="text-color-secondary">
       ({{ $t(goal.direction) }})
    </span>
    <span v-if="givenGoals_compare.find(a => a.name === goal.name)">
      ,<b> {{ $t("compare") }}: - {{ $t("given") }}:
      {{get_selected_name(goal.name) }} </b>
      <span class="text-color-secondary">
                   ({{ $t(goal.direction) }})
      </span>
    </span>
  </div>

  <div v-for="goal in givenGoals" :key="goal.name">
    {{ Store.labels.nodes[goal.name] }} - <b> {{ $t("given") }}:
    {{ get_selected_name(goal.name) }} </b>
    <span class="text-color-secondary">
        ({{ $t(goal.direction) }})
    </span>
    <span v-if="givenGoals_compare.find(a => a.name === goal.name)">
      ,<b> {{ $t("compare") }}: - {{ $t("given") }}:
      {{get_selected_name(goal.name)}}
      <span class="text-color-secondary">
                  ({{ $t(goal.direction) }})
      </span>
    </b>
    </span>
  </div>

  <!-- Phase Interventions-->
  <div class="text-left pt-4" v-if="PatientStore.targets.length > 0 || givenTargets.length > 0 ||
            givenTargets_compare.length > 0"><b>
    {{ $t("Interventions") }}:
  </b></div>
  <div v-for="target in PatientStore.targets" :key="target.name">
    {{ Store.labels.nodes[target.name] }}
  </div>
  <div v-for="target in givenTargets" :key="target.name">
    {{ Store.labels.nodes[target.name] }} - <b> {{ $t("given") }}:
    {{ Store.labels.states[target.name][target.selected.name] }} </b>
  </div>
  <div v-for="target in givenTargets_compare" :key="target.name">
    {{ $t("compare") }}: {{ Store.labels.nodes[target.name] }} - <b> {{ $t("given") }}:
    {{ Store.labels.states[target.name][target.selected.name] }} </b>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {useStore} from '../../store.ts';
import {usePatientStore} from "../../stores/patient_store.ts";
import {NEvidence} from "../../types/node_types.ts";
import {PhaseGoal} from "../../types/phase_types.ts";

export default defineComponent({
  name: "defined-phases",
  setup() {
    const Store = useStore()
    const PatientStore = usePatientStore()
    return {Store, PatientStore}
  },
  computed: {
    /**
     * returns goals that are predefined by the current phase but already entered as evidence
     *
     * @returns {Object[]}
     */
    givenGoals: function () : PhaseGoal[] {
      let givenGoals: PhaseGoal[] = []
      if (this.Store.currentPhase !== null) {
        let goals = this.Store.currentPhase.sets.goal
        goals.forEach((g: PhaseGoal) => {
          let ev = this.PatientStore.evidence.find((e: NEvidence) => e.name === g.name)
          if (ev) {
            givenGoals.push(g)
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
    givenGoals_compare: function () : NEvidence[] {
      let givenGoals_compare: NEvidence[] = []
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
        targets.forEach((t: string) => {
          let ev = this.PatientStore.evidence.find((e: NEvidence) => e.name === t)
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
    givenTargets_compare: function (): NEvidence[] {
      let givenTargets_compare: NEvidence[] = []
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
  },
  methods: {
    /**
     * returns name of selected goal
     *
     * @param goal
     */
    get_selected_name: function (goalname: string) : string {
      let compare_goal = this.givenGoals_compare.find(a => a.name === goalname)
      if (compare_goal) {
        return this.Store.labels.states[goalname][compare_goal.selected.name]
      }
      else return ""
    }
  }
})
</script>

<style scoped>

</style>