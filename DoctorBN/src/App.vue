<template>

  <Header/>


    <div class="p-grid p-flex-column" >
      <div class="p-grid p-col p-flex-row">
        <div class="p-col">
          <Evidence/>
        </div>
        <div class="p-col">
          <Target/>
        </div>
        <div class="p-col">
          <Relevance/>
        </div>
        <div class="p-col">
          <Additional/>
        </div>
      </div>

      <div class="p-col">
        <Network/>
      </div>

    </div>

</template>

<script>
import Header from './components/Header.vue'
import Evidence from './components/Evidence.vue'
import Target from './components/Target.vue'
import Relevance from './components/Relevance.vue'
import Additional from './components/additional.vue'
import Network from './components/Network.vue'


export default {
  name: 'App',
  components: {
    Header,
    Evidence,
    Target,
    Relevance,
    Additional,
    Network
  }
}
</script>

<style>
body, html {
  height: 100%;
  padding: 0;
  margin: 0
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-color: #6eb5be;
  height: 100%;
}

.p-grid {
  padding: 10px;
  margin-top: 10px
}


</style>
