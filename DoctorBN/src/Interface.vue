<template>

  <Header @changePage="changePage()"/>
<div> DOGS!!! {{dogs}}</div>
  <div class=" p-grid p-flex-column nested-grid">
    <div class="p-grid p-d-flex" style="height: 50%">
      <div class="p-col-2">
        <NodeInput title = "Evidence" @setNodes="evidence = $event"/>
      </div>
      <div class="p-col-2">
        <Therapy/>
      </div>
      <div class="p-col-2">
        <NodeInput title = "Desired Outcomes" @setNodes="goals = $event"/>
      </div>
      <div class="p-col">
        <Relevance v-if="target !== null"/>
      </div>
    </div>
    <div class="p-grid p-d-flex" style="height: 50%">
      <div class="p-col">
        <Network :target='target'/>
      </div>
      <div class="p-col-3">
        <Additional/>
      </div>
    </div>
  </div>
</template>

<script>
import Header from "./components/Header";
import NodeInput from "./components/NodeInput";
import Therapy from "./components/Therapy";
import Relevance from "./components/Relevance";
import Additional from "./components/additional";
import Network from "./components/Network";

export default {
  name: "Interface",
  components: {
    Header,
    NodeInput,
    Therapy,
    Relevance,
    Additional,
    Network
  },
  data() {
    return {
      target: "Therapy",
      evidence: null,
      goals: null,
      nodes: null
    }
  },
  methods: {
    changePage() {
      this.$emit("changePage")
    }
  },
  created: async function(){
        const gResponse = await fetch("http://localhost:5000/cancernet");
        const gObject = await gResponse.json();
        this.nodes  = gObject.nodes;
    }
}
</script>

<style scoped>

.p-grid {
  margin-top: 0px;
  margin-bottom: 10px
}

#arrow {
  width: 100%;
  height: 30%;
}

</style>