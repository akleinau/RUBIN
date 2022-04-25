<template>
  <Card :class="getCardClass()">
    <template #title>
      {{ $t("Explanation") }}
      <Button icon="pi pi-question" class="p-button-text p-button-secondary p-button-rounded p-button-raised help" @click="$refs.op.toggle($event)" />
      <OverlayPanel ref="op" style="width: 500px">
        {{ $t("ExplanationHelp") }}
          <h3>{{ $t("Relevance") }}</h3> {{ $t("RelevanceHelp") }}
          <h3>{{ $t("AllPredictions") }}</h3> {{ $t("AllPredictionsHelp") }}
          <h3> {{ $t("CompactNetwork") }}</h3> {{ $t("CompactNetworkHelp") }}
          <h3> {{ $t("FullNetwork") }}</h3> {{ $t("FullNetworkHelp") }}
      </OverlayPanel>
    </template>
    <template #subtitle v-if="Store.options.selectedOption">
      <div  v-for="o in Object.keys(Store.options.selectedOption.option)" :key="o">
        <b>  {{Store.labels[o]}}: {{Store.options.selectedOption.option[o]}} </b>
      </div>
    </template>
    <template #content>
      <ScrollPanel style="height:100%">
        <ProgressBar v-if="Store.explanationLoading" mode="indeterminate" style="height: .5em"/>
        <TabView v-else>
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
            <div v-if="Store.selectedConfig==null">
              <sugiyama :edges="getCompactEdges()" :nodes="getExNodes()" :labels="Store.labels"/>
            </div>
            <div v-else>
              <sugiyamaCompare :edges="getCompactEdges()" :nodes="getExNodes()"
                               :nodes2="Store.selectedConfig.config.explain.states"
                               :name2="Store.selectedConfig.name" :labels="Store.labels"/>
            </div>
          </TabPanel>
          <!--   full network  -->
          <TabPanel :header="$t('FullNetwork')">
            <div v-if="Store.selectedConfig==null">
              <sugiyama :edges="Store.edges" :nodes="Store.explain.states" :labels="Store.labels"/>
            </div>
            <div v-else>
              <sugiyamaCompare  :edges="Store.edges" :nodes="Store.explain.states" :nodes2="Store.selectedConfig.config.explain.states"
                               :name2="Store.selectedConfig.name" :labels="Store.labels"/>
            </div>
          </TabPanel>
        </TabView>
      </ScrollPanel>
    </template>
  </Card>
</template>

<script>
import Relevance from "@/components/explanation/Relevance";
import sugiyama from "@/components/visualisations/sugiyama";
import NodeList from "@/components/explanation/NodeList";
import sugiyamaCompare from "@/components/visualisations/sugiyamaCompare";
import { useStore } from '@/store'

export default {
  name: "Network",
  components: {
    Relevance,
    sugiyama,
    NodeList,
    sugiyamaCompare
  },
  setup() {
    const Store = useStore()
    return { Store }
  },
  data() {
    return {
      onlyGlobal: true,
      compactEdges: null,
      exNodes: null
    }
  },
  computed: {
    compactNetwork: function () {
      if (this.Store.explain.explanation == null) {
        return null
      }
        //nodes

        let explanationNodes = []
        this.Store.explain.explanation["nodes"].forEach(node => {
          let originalNode = this.Store.explain.states.find(n => n.name === node)
          if (originalNode != null) {
            explanationNodes.push(originalNode)
          } else {
            explanationNodes.push({"name": node, "probability": "1.0"})
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

        return  {
          "compactEdges": edges,
          "compactNodes": explanationNodes
        }
    }
  },
  methods: {
    getExEdges() {
      if (this.Store.explain.explanation != null) {
        return this.Store.explain.explanation["edges"]
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
    },
    getCardClass() {
      if (this.Store.options.selectedOption === null) return null
      return (Object.entries(this.Store.options.selectedOption.option).length === 0) ? null: "treatmentCard"
    }
  }
}
</script>

<style lang="scss" scoped>

.p-card {
  height: 100% !important;
}

.treatmentCard {
    border: 10px solid #b3b3b3;
}

.help {
  position:absolute;
  right:5%
}
.buttons {
  position:absolute;
  right:5%
}

li {
  margin:5px
}

</style>