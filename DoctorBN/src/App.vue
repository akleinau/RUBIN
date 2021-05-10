<template>
  <w-app>
    <header>
        <Header/>
    </header>
    <main>
    <w-flex class="text-left column grow wrap fill-height" >
      <div class="w-flex" id="row1">
        <div class="xs2 pa1">
          <Evidence/>
        </div>
        <div class="xs2 pa1">
          <Target/>
        </div>
        <div class="xs6 pa1">
          <Relevance/>
        </div>
        <div class="xs2 pa1">
          <Additional/>
        </div>
      </div>

      <div>
        <Network/>
      </div>

    </w-flex>
</main>

  </w-app>
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

.w-flex {
  width: 100%
}

</style>
