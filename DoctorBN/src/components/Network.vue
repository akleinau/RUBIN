<template >
  <Panel header="Explanation" style="position: relative">
  <TabView>
    <TabPanel header="Relevance">
      <Relevance :relevance="relevance" :goals="goals" :nodes="nodes"/>
    </TabPanel>
    <TabPanel header="Reasoning">
      <sugiyama :edges="getExEdges()" :nodes="getExNodes()"/>
    </TabPanel>
    <TabPanel header="compact network">
      <sugiyama :edges="getCompactEdges()" :nodes="getExNodes()"/>
    </TabPanel>
    <TabPanel header="full network">
      <BNvis :edges="edges" :nodes="nodes"/>
    </TabPanel>
    <TabPanel header="sugiyama">
      <sugiyama :edges="edges" :nodes="nodes"/>
    </TabPanel>
    <TabPanel header="list">
      <NodeList :nodes="nodes" />
    </TabPanel>
  </TabView>
</Panel>
</template>

<script>
import Relevance from "./Relevance";
import BNvis from "@/components/visualisations/BNvis";
import sugiyama from "@/components/visualisations/sugiyama";
import NodeList from "@/components/additional/NodeList";

export default {
  name: "Network",
  props: ['relevance', 'goals', "edges", "nodes", "explanation"],
  components: {
    Relevance,
    BNvis,
    sugiyama,
    NodeList
  },
  data() {
    return {
      onlyGlobal: true,
    }
  },
  methods: {
    getExEdges() {
      if (this.explanation != null) {
        return this.explanation["edges"]
      }
    },
    getExNodes() {
     if (this.explanation != null) {
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
       return explanationNodes
     }
    },
    getCompactEdges() {
      if (this.explanation != null) {
        let edges = []
        console.log(this.edges)
        this.edges.forEach(edge => {
          if (this.explanation["nodes"].includes(edge["source"]) && this.explanation["nodes"].includes(edge["target"])) {
            console.log(edge)
            console.log(this.explanation["nodes"])
            edges.push(edge)
          }
        })
        return edges
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.p-panel {
  color: red;
  height: 100% !important;

  display: grid;
  grid-template-rows: auto 1fr;
}

::v-deep(.p-panel-content) {
height: 100% !important;
}

</style>