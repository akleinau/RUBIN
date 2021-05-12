<template>

  <Header @changePage="changePage()"/>

<div class=" p-grid p-flex-column nested-grid">
    <div class="p-grid p-d-flex" style="height: 50%">
      <div class="p-col-2">
        <Evidence @setEvidence="evidence = $event" />
      </div>
      <div class="p-d-flex p-col-fixed p-ai-center p-flex-wrap" style="width:50px">
        <img src="./assets/Arrow.svg" id="arrow">
      </div>
      <div class="p-col-2">
        <Target @setTarget="target = $event"/>
      </div>
      <div class="p-col">
        <Relevance v-if="target !== null"/>
      </div>
      <div class="p-col-3">
        <Additional />
      </div>
    </div>

    <div class="p-col">
      <Network :target='target' />
    </div>
</div>
</template>

<script>
import Header from "./components/Header";
import Evidence from "./components/Evidence";
import Target from "./components/Target";
import Relevance from "./components/Relevance";
import Additional from "./components/additional";
import Network from "./components/Network";

export default {
  name: "Interface",
  components: {
    Header,
    Evidence,
    Target,
    Relevance,
    Additional,
    Network
  },
  data() {
    return {
      target: null,
      evidence: null
    }
  },
  methods: {
    changePage() {
      this.$emit("changePage")
    }
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