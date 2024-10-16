<template>
  <Card :class="getCardClass()" class="h-full overflow-hidden">
    <template #title>
      {{ $t("Explanation") }}
      <Button icon="pi pi-question" class="p-button-outlined p-button-secondary p-button-rounded p-button-raised help"
              @click="$refs.op.toggle($event)"/>
      <OverlayPanel ref="op" style="width: 400px">
        {{ $t("ExplanationHelp") }}
        <h3>{{ $t("Relevance") }}</h3> {{ $t("RelevanceHelp") }}
        <h3>{{ $t("AllPredictions") }}</h3> {{ $t("AllPredictionsHelp") }}
        <h3> {{ $t("CompactNetwork") }}</h3> {{ $t("CompactNetworkHelp") }}
        <h3> {{ $t("FullNetwork") }}</h3> {{ $t("FullNetworkHelp") }}
      </OverlayPanel>
    </template>
    <template #subtitle v-if="Store.predictions.selectedOption">
      <div v-for="o in Object.keys(Store.predictions.selectedOption.option)" :key="o">
        <b> {{ Store.labels.nodes[o] }}: {{ Store.labels.states[o][Store.predictions.selectedOption.option[o]] }} </b>
      </div>
    </template>
    <template #content>
      <div v-if="!Store.optionsLoading" class="h-full">
        <ProgressBar v-if="Store.explanationLoading" mode="indeterminate" style="height: .5em"/>
        <div v-else class="flex flex-column overflow-hidden h-full flex-align-full w-full">
          <Dropdown v-model="currentIndex" optionLabel="label" optionValue="value"
                    :options="options" id="explanationDropdown" @click="DropdownClicked" @change="DropdownChanged"
                    class="flex">
          </Dropdown>
          <TabView v-model:active-index="currentIndex" scrollable class="flex-1 overflow-hidden">
            <!--   relevance  -->
            <TabPanel :header="$t('Relevance')">
              <Relevance/>
            </TabPanel>
            <!--   all predictions  -->
            <TabPanel :header="$t('AllPredictions')">
              <NodeList/>
            </TabPanel>
            <!--   compact network  -->
            <TabPanel :header="$t('CompactNetwork')">
              <div v-if="Store.compareConfig==null">
                <sugiyama :highlight="true" :edges="Store.edges" :highlightEdges="getCompactEdges()"
                          :nodes="Store.explain.states" :highlightNodes="getExNodes()"/>
              </div>
              <div v-else>
                <sugiyamaCompare :highlight="true" :highlightEdges="getCompactEdges()" :highlightNodes="getExNodes()"
                                 :nodes="Store.explain.states" :edges="Store.edges"
                                 :nodes2="Store.compareConfig.explain.states"/>
              </div>
            </TabPanel>
            <!--   full network  -->
            <TabPanel :header="$t('FullNetwork')">
              <div v-if="Store.compareConfig==null">
                <sugiyama :highlight="false" :edges="Store.edges" :nodes="Store.explain.states"/>
              </div>
              <div v-else>
                <sugiyamaCompare :highlight="false" :edges="Store.edges" :nodes="Store.explain.states"
                                 :nodes2="Store.compareConfig.explain.states"/>
              </div>
            </TabPanel>
          </TabView>
        </div>
      </div>
    </template>
  </Card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Relevance from "../components/explanation/relevance-explanation.vue";
import sugiyama from "../components/explanation/sugiyama-vis.vue";
import NodeList from "../components/explanation/list-explanation.vue";
import sugiyamaCompare from "../components/explanation/sugiyama-vis-compare.vue";
import {useStore} from "../store"
import {StateExplanation} from "../types/explanation_types.ts"

export default defineComponent({
  name: "page-explanation",
  components: {
    Relevance,
    sugiyama,
    NodeList,
    sugiyamaCompare
  },
  setup() {
    const Store = useStore()
    return {Store}
  },
  created() {
    this.options = this.getOptions()
  },
  data() {
    return {
      onlyGlobal: true,
      compactEdges: null,
      exNodes: null,
      currentIndex: 0,
      options: [] as { label: string, value: number }[]
    }
  },
  watch: {
      /**
       * shows relevance view when tutorial is started and ended
       */
    tutorialStep: function () {
      if (this.tutorialStep === 1 || this.tutorialStep === 12) {
        this.currentIndex = 0
      }
    },
      /**
       * updates menu when language is changed. Necessary as translations were buggy otherwise
       */
    language: function () {
      this.options = this.getOptions()
    }
  },
  computed: {
    tutorialStep: function () {
      return this.Store.tutorialStep
    },
      /**
       * computes all necessary information for the compact network view
       *
       * @returns {{compactNodes: *[], compactEdges: *[]}|null}
       */
    compactNetwork: function () {
      if (this.Store.explain.explanation == null) {
        return null
      }
      //nodes

      let explanationNodes = [] as StateExplanation[]
      this.Store.explain.explanation["nodes"].forEach(node => {
        let originalNode = this.Store.explain.states.find(n => n.name === node)
        if (originalNode != null) {
          explanationNodes.push(originalNode)
        } else {
          explanationNodes.push({"name": node, "probability": 1.0})
        }
      })

      //edges
      let edges = []

      let connectedNodes = new Set()
      this.Store.edges.forEach(edge => {
        if (this.Store.explain.explanation["nodes"].includes(edge["source"]) && this.Store.explain.explanation["nodes"].includes(edge["target"])) {
          edges.push(edge)
          connectedNodes.add(edge["source"])
          connectedNodes.add(edge["target"])
        }
      })
      let notConnectedNodes = this.Store.explain.explanation["nodes"].filter(x => !connectedNodes.has(x))
      notConnectedNodes.forEach(node => {
        let neighborNodes = this.Store.explain.states.filter(n =>
            this.Store.edges.find(e => e["source"] === node && e["target"] === n.name) != null)
        neighborNodes.forEach(n => {
          let otherEdges = this.Store.edges.filter(e => e["target"] === n.name)
          otherEdges.forEach(oe => {
            if (oe["source"] !== node && this.Store.explain.explanation["nodes"].includes(oe["source"])) {
              if (!explanationNodes.includes(n)) {
                explanationNodes.push(n)
              }
              edges.push({"source": node, "target": n.name})
              edges.push(oe)
            }
          })
        })

      })
      //remove duplicates
      edges = edges.filter(e => edges.find(e2 => e2["source"] === e["source"] && e2["target"] === e["target"]) === e)

      return {
        "compactEdges": edges,
        "compactNodes": explanationNodes
      }
    },
    language: function () {
      return this.Store.language
    },
  },
  methods: {
      /**
       * returns compact network edges
       *
       * @returns {*[]}
       */
    getCompactEdges() {
      if (this.compactNetwork != null) {
        return this.compactNetwork.compactEdges
      }
    },
      /**
       * returns compact network nodes
       *
       * @returns {*[]}
       */
    getExNodes() {
      if (this.compactNetwork != null) {
        return this.compactNetwork.compactNodes
      }
    },
      /**
       * sets "treatmentCard" class when a treatment is selected in prediction view.
       * As a result, a gray box is shown around the explanation view to highlight the change.
       *
       * @returns {null|string}
       */
    getCardClass() {
      if (this.Store.predictions.selectedOption === null) return null
      if (this.Store.predictions.selectedOption === undefined) return null
      return (Object.entries(this.Store.predictions.selectedOption.option).length === 0) ? null : "treatmentCard"
    },
      /**
       * updates tutorial when dropdown is selected
       */
    DropdownClicked() {
      if (this.Store.tutorialStep === 7) {
        this.Store.tutorialStep = 8
      }
    },
       /**
       * updates tutorial when dropdown is changed
       */
    DropdownChanged() {
      if (this.Store.tutorialStep === 8 && this.currentIndex === 1) {
        this.Store.tutorialStep = 9
      } else if (this.Store.tutorialStep === 8) {
        this.Store.tutorialStep = 7
      }
      // eslint-disable-next-line
      umami.track('button-explanation',
          {index: this.currentIndex, network: this.Store.network, compare: this.Store.compareConfig!=null });

    },
      /**
       * returns options for explanation dropdown menu
       *
       * @returns {Object[]}
       */
    getOptions() {
      return [
        {label: this.$t("Relevance"), value: 0},
        {label: this.$t("AllPredictions"), value: 1},
        {label: this.$t("CompactNetwork"), value: 2},
        {label: this.$t("FullNetwork"), value: 3}
      ]
    }
  }
})
</script>

<style lang="scss" scoped>

.p-card {
  height: 100% !important;
}

.treatmentCard {
  border: 10px solid #b3b3b3;
}

.help {
  position: absolute;
  right: 5%
}

.buttons {
  position: absolute;
  right: 5%
}

li {
  margin: 5px
}

::v-deep(.p-tabview-nav-container) {
  display: None;
}

::v-deep(.p-tabview-panels) {
  height: 100%
}

::v-deep(.p-tabview-panel) {
  height: 100%
}

::v-deep(.p-dropdown-label) {
  color:#4F46E5;
  font-weight: 700
}

</style>