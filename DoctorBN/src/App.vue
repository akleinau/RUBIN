<template>
<el-container>
      <el-header> <Header class="header"/></el-header>
<el-main>
  <el-row id = "main">
    <el-col :span="4">
      <Evidence/>
    </el-col>
    <el-col :span="4">
      <Target/>
    </el-col>
    <el-col :span="10">
      <Relevance/>
    </el-col>
    <el-col :span="4">
      <Additional/>
    </el-col>
  </el-row>
  <el-row id="network">
    <el-col>
      <Network/>
    </el-col>

  </el-row>
</el-main>
  <el-footer> Hi</el-footer>
</el-container>
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

.el-col {
  margin-right: 10px

}

.el-container {
  height: 100%
}

#main {
  height: 500px
}

#network {
  height: 200px
}

</style>
