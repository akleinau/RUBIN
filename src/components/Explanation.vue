<template>
  <Card>
    <template #title>
      Explanation
      <Button icon="pi pi-question" class="p-button-text p-button-secondary help" @click="$refs.op.toggle($event)" />
      <OverlayPanel ref="op" style="width: 500px">
        Here different types of explanation and additional information are displayed.

          <h3>Relevance</h3> This view displays the importance of all evidences and interventions for the desired
          outcomes. Changing nodes with a higher relevance will impact the result more, than changing nodes with lesser
          relevance.
          <h3>All predictions</h3>This view displays the predictions of the network for all nodes. The network
          additionally provides information on how sure it is with this prediction.
          <h3> compact network</h3> This view displays the network in a compact way, showing only the most
          important nodes.
          <h3> full network</h3> This view displays the full network with all nodes and edges. Two different
          views of the network are provided, please send feedback which you like more!
      </OverlayPanel>
    </template>
    <template #content>
      <ScrollPanel style="height:100%">
        <ProgressBar v-if="loading" mode="indeterminate" style="height: .5em"/>
        <TabView>
          <TabPanel header="Relevance">
            <Relevance :relevance="explain.relevance" :goals="goals" :nodes="explain.states" :compareConfig="compareConfig"/>
          </TabPanel>
          <TabPanel header="all predictions">
            <NodeList :nodes="explain.states" :compareConfig="compareConfig"/>
          </TabPanel>
          <TabPanel header="compact network">
            <div v-if="compareConfig==null">
              <sugiyama :edges="getCompactEdges()" :nodes="getExNodes()"/>
            </div>
            <div v-else>
              <sugiyamaCompare :edges="getCompactEdges()" :nodes="getExNodes()"
                               :nodes2="compareConfig.config.explain.states"
                               :name2="compareConfig.name"/>
            </div>
          </TabPanel>
          <TabPanel header="full network">
            <Button label="change layout" class="p-button-secondary" @click="fullNetworkLayout = !fullNetworkLayout"/>
            <divider />
            <div v-if="compareConfig==null">
              <BNvis v-if="fullNetworkLayout" :edges="edges" :nodes="explain.states"/>
              <sugiyama v-else :edges="edges" :nodes="explain.states"/>
            </div>
            <div v-else>
              <BNvisCompare v-if="fullNetworkLayout" :edges="edges" :nodes="explain.states"
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
  props: ['goals', "edges", "explain", "compareConfig", "loading"],
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
      fullNetworkLayout: true,
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