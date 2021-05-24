<template>
  <TabView>
    <TabPanel header="Causal explanation">
      <img v-if="target !== null" src="../assets/Argumentation.png">
      <div v-else>Please specify a target.</div>
    </TabPanel>
    <TabPanel header="Causal explanation computed">
      <BNvis :edges="getExEdges()" :nodes="getExNodes()"/>
    </TabPanel>
    <TabPanel header="compact network">
      <img v-if="target !== null" src="../assets/compactNet.png">
      <div v-else>Please specify a target.</div>
    </TabPanel>
    <TabPanel header="full network">
      <img src="../assets/fullNet.png">
    </TabPanel>
    <TabPanel header="full network computed">
      <BNvis :edges="edges" :nodes="nodes"/>
    </TabPanel>
    <TabPanel header="RelevanceComputed">

      <Relevance :relevance="relevance" :goals="goals"/>

    </TabPanel>
    <TabPanel header="Relevance">
      <div v-if="onlyGlobal">
        <img src="../assets/globalRelevance.png">
        <Button label="show more" @click="onlyGlobal=false"></Button>
      </div>
      <div v-if="!onlyGlobal">
        <img src="../assets/localRelevance.png">
        <Button label="show less" @click="onlyGlobal=true"></Button>
      </div>
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
         explanationNodes.push({"name": node["name"], "probability": "1.0"})
       })
       return explanationNodes
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