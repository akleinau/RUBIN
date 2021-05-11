<template>

  <Header @changePage="changePage()"/>


    <div class="p-grid p-flex-column p-ai-stretch" >
      <div class="p-grid p-col p-flex-row">
        <div class="p-col-2">
          <Evidence/>
        </div>
        <div class="p-col-2">
          <Target/>
        </div>
        <div class="p-col">
          <Relevance/>
        </div>
        <div class="p-col-3">
          <Additional/>
        </div>
      </div>
       <div class="p-col">
      <div class="box box-stretched">
        <Network/>
      </div>
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
</style>