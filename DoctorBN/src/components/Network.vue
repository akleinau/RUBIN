<template>
  <TabView>
    <TabPanel header="Relevance">
      <Relevance :relevance="relevance" :goals="goals"/>
    </TabPanel>
    <TabPanel header="Causal explanation">
      <BNvis :edges="getExEdges()" :nodes="getExNodes()"/>
    </TabPanel>
    <TabPanel header="compact network">
      <BNvis :edges="getCompactEdges()" :nodes="getExNodes()"/>
    </TabPanel>
    <TabPanel header="full network">
      <BNvis :edges="edges" :nodes="nodes"/>
    </TabPanel>
  </TabView>

</template>

<script>
import Relevance from "./Relevance";
import BNvis from "@/components/visualisations/BNvis";

export default {
  name: "Network",
  props: ['relevance', 'goals', "edges", "nodes", "explanation"],
  components: {
    Relevance,
    BNvis
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
         explanationNodes.push({"name": node, "probability": "1.0"})
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

<style scoped>
img {
  height: 100%;
}
</style>