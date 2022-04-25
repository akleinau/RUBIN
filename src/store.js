import {defineStore} from 'pinia';

export const useStore = defineStore('store', {
  state: () => ({
    //data that is specific to the patient
    patient: {
        targets: [],
        evidence: [],
        goals: [],
        nodes: [], //nodes of the network that are neither evidence, goals, nor targets
        name: "",
      },

      //available options to treat the patient given the interventions
      options: {
        options: null,
        likelyResult: null,
        selectedOption: null,
      },

      //explaining calculations for the chosen option
      explain: {
        explanation: null,
        relevance: null,
        states: null,
      },

      edges: null, //edges of the network
      labels: null,

      configurations: [],
      selectedConfig: null,

      newGoals: null, //helper property to let the data tables update TODO: replace

      optionsLoading: false,
      explanationLoading: false,

    description: ""
  })
})