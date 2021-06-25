<template>
  <Card>
    <template #title>
      {{ $t("Explanation") }}
      <Button icon="pi pi-question" class="p-button-text p-button-secondary help" @click="$refs.op.toggle($event)" />
      <OverlayPanel ref="op" style="width: 500px">
        {{ $t("ExplanationHelp") }}
          <h3>{{ $t("Relevance") }}</h3> {{ $t("RelevanceHelp") }}
          <h3>{{ $t("AllPredictions") }}</h3> {{ $t("AllPredictionsHelp") }}
          <h3> {{ $t("CompactNetwork") }}</h3> {{ $t("CompactNetworkHelp") }}
          <h3> {{ $t("FullNetwork") }}</h3> {{ $t("FullNetworkHelp") }}
      </OverlayPanel>
    </template>
    <template #content>
      <ScrollPanel style="height:100%">
        <ProgressBar v-if="loading" mode="indeterminate" style="height: .5em"/>
        <TabView>
          <TabPanel :header="$t('Relevance')">
            <Relevance :relevance="explain.relevance" :goals="goals" :nodes="explain.states"
            :compareConfig="compareConfig" :selectedOption="selectedOption"/>
          </TabPanel>
          <TabPanel :header="$t('AllPredictions')">
            <NodeList :nodes="explain.states" :compareConfig="compareConfig"/>
          </TabPanel>
          <TabPanel :header="$t('CompactNetwork')">
            <div v-if="compareConfig==null">
              <sugiyama :edges="getCompactEdges()" :nodes="getExNodes()"/>
            </div>
            <div v-else>
              <sugiyamaCompare :edges="getCompactEdges()" :nodes="getExNodes()"
                               :nodes2="compareConfig.config.explain.states"
                               :name2="compareConfig.name"/>
            </div>
          </TabPanel>
          <TabPanel :header="$t('FullNetwork')">
            <Dropdown v-model="fullNetworkLayout" :options="layouts" optionLabel="name" class="p-mb-2"/>
            <div v-if="compareConfig==null">
              <BNvis v-if="fullNetworkLayout.name === 'Force-directed'" :edges="edges" :nodes="explain.states"/>
              <sugiyama v-else :edges="edges" :nodes="explain.states"/>
            </div>
            <div v-else>
              <BNvisCompare v-if="fullNetworkLayout.name === 'Force-directed'" :edges="edges" :nodes="explain.states"
                            :nodes2="compareConfig.config.explain.states"
                            :name2="compareConfig.name"/>
              <sugiyamaCompare v-else :edges="edges" :nodes="explain.states" :nodes2="compareConfig.config.explain.states"
                               :name2="compareConfig.name"/>
            </div>
          </TabPanel>
        </TabView>
      </ScrollPanel>
    </template>
  </Card>
</template>

<script>
import Relevance from "@/components/explanation/Relevance";
import BNvis from "@/components/visualisations/BNvis";
import sugiyama from "@/components/visualisations/sugiyama";
import NodeList from "@/components/explanation/NodeList";
import sugiyamaCompare from "@/components/visualisations/sugiyamaCompare";
import BNvisCompare from "@/components/visualisations/BNvisCompare";

export default {
  name: "Network",
  props: ['goals', "edges", "explain", "compareConfig", "loading", "selectedOption"],
  components: {
    Relevance,
    BNvis,
    sugiyama,
    NodeList,
    sugiyamaCompare,
    BNvisCompare
  },
  data() {
    return {
      onlyGlobal: true,
      compactEdges: null,
      exNodes: null,
      fullNetworkLayout: {name: 'Sugiyama'},
      layouts: [
        {name: 'Sugiyama'},
        {name: 'Force-directed'}
      ]
    }
  },
  computed: {
    compactNetwork: function () {

      if (this.explain.explanation == null) {
        return null
      }
        //nodes

        let explanationNodes = []
        this.explain.explanation["nodes"].forEach(node => {
          let originalNode = this.explain.states.find(n => n.name === node)
          if (originalNode != null) {
            explanationNodes.push(originalNode)
          } else {
            explanationNodes.push({"name": node, "probability": "1.0"})
          }
        })

        //edges
        let edges = []

        let connectedNodes = new Set()
        this.edges.forEach(edge => {
          if (this.explain.explanation["nodes"].includes(edge["source"]) && this.explain.explanation["nodes"].includes(edge["target"])) {
            edges.push(edge)
            connectedNodes.add(edge["source"])
            connectedNodes.add(edge["target"])
          }
        })
        let notConnectedNodes = this.explain.explanation["nodes"].filter(x => !connectedNodes.has(x))
        notConnectedNodes.forEach(node => {
          let neighborNodes = this.explain.states.filter(n =>
              this.edges.find(e => e["source"] === node && e["target"] === n.name) != null)
          neighborNodes.forEach(n => {
            let otherEdges = this.edges.filter(e => e["target"] === n.name)
            otherEdges.forEach(oe => {
              if (oe["source"] !== node && this.explain.explanation["nodes"].includes(oe["source"])) {
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

        return  {
          "compactEdges": edges,
          "compactNodes": explanationNodes
        }
    }
  },
  methods: {
    getExEdges() {
      if (this.explain.explanation != null) {
        return this.explain.explanation["edges"]
      }
    },
    getCompactEdges() {
      if (this.compactNetwork != null) {
        return this.compactNetwork.compactEdges
      }
    },
    getExNodes() {
      if (this.compactNetwork != null) {
        return this.compactNetwork.compactNodes
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.p-card {
  height: 100% !important;
}

.help {
  position:absolute;
  right:5%
}

li {
  margin:5px
}

</style>