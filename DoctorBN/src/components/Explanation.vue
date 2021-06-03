<template >
  <Card style="position: relative">
    <template #title>
      Explanation
    </template>
    <template #content>
      <ProgressBar v-if="loading" mode="indeterminate" style="height: .5em"/>
  <TabView>
    <TabPanel header="Relevance">
      <Relevance :relevance="relevance" :goals="goals" :nodes="nodes"/>
    </TabPanel>
    <TabPanel header="all predictions">
      <NodeList :nodes="nodes" :compareConfig="compareConfig == null? null: compareConfig.states" />
    </TabPanel>
    <TabPanel header="compact network">
      <sugiyama :edges="getCompactEdges()" :nodes="getExNodes()"/>
    </TabPanel>
    <TabPanel header="full network">
      <BNvis v-if="fullNetworkLayout" :edges="edges" :nodes="nodes" />
      <sugiyama v-else :edges="edges" :nodes="nodes"/>
      <Button label="change layout" @click="fullNetworkLayout = !fullNetworkLayout" />
    </TabPanel>
  </TabView>
      </template>
</Card>
</template>

<script>
import Relevance from "@/components/explanation/Relevance";
import BNvis from "@/components/visualisations/BNvis";
import sugiyama from "@/components/visualisations/sugiyama";
import NodeList from "@/components/explanation/NodeList";

export default {
  name: "Network",
  props: ['relevance', 'goals', "edges", "nodes", "explanation", "compareConfig", "loading"],
  components: {
    Relevance,
    BNvis,
    sugiyama,
    NodeList
  },
  data() {
    return {
      onlyGlobal: true,
      compactEdges: null,
      exNodes: null,
      fullNetworkLayout: true
    }
  },
  watch: {
    explanation: function() {
      if (this.explanation != null) {
        //nodes
        let explanationNodes = []
       this.explanation["nodes"].forEach(node => {
         let originalNode = this.nodes.find(n => n.name === node)
         if (originalNode != null) {
           explanationNodes.push(originalNode)
         }
        else {
           explanationNodes.push({"name": node, "probability": "1.0"})
         }
       })

        //edges
        let edges = []

        let connectedNodes = new Set()
        this.edges.forEach(edge => {
          if (this.explanation["nodes"].includes(edge["source"]) && this.explanation["nodes"].includes(edge["target"])) {
            edges.push(edge)
            connectedNodes.add(edge["source"])
            connectedNodes.add(edge["target"])
          }
        })
        let notConnectedNodes = this.explanation["nodes"].filter(x => !connectedNodes.has(x))
        console.log("not connected:")
        console.log(notConnectedNodes)
        notConnectedNodes.forEach(node => {
          let neighborNodes = this.nodes.filter(n =>
              this.edges.find(e => e["source"] === node && e["target"] === n.name) != null)
          neighborNodes.forEach(n => {
            let otherEdges = this.edges.filter(e => e["target"] === n.name)
            otherEdges.forEach(oe => {
              if (oe["source"] !== node && this.explanation["nodes"].includes(oe["source"])) {
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
        console.log("found:")
        console.log(edges)
        edges = edges.filter(e => edges.find(e2 => e2["source"] === e["source"] && e2["target"] === e["target"]) === e)
        console.log(edges)

        this.compactEdges = edges
        this.exNodes = explanationNodes
      }
    }
  },
  methods: {
    getExEdges() {
      if (this.explanation != null) {
        return this.explanation["edges"]
      }
    },
    getCompactEdges() {
      if (this.compactEdges != null) {
        return this.compactEdges
      }
    },
    getExNodes() {
      if (this.exNodes != null) {
        return this.exNodes
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.p-card {
  height: 100% !important;

  display: grid;
  grid-template-rows: auto 1fr;
}

::v-deep(.p-panel-content) {
height: 100% !important;
}

</style>