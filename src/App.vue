<template>
  <div class="p-0 m-0 min-h-full" style="background-color: #372f5e">
      <ChooseNet v-if="page === 'chooseNet'" @changePage="loadNetwork($event)"
                 @loadLocalNet="loadLocalNet($event)"></ChooseNet>
      <Interface v-if="page === 'interface'" @changePage="page = 'chooseNet'" :network="selectedNetwork"
                 :localNet="localNet"/>
  </div>
</template>

<script>
import Interface from "./page-interface.vue";
import ChooseNet from "./page-choose-net.vue";

export default {
  name: 'App',
  components: {
    Interface,
    ChooseNet
  },
  created() {
    document.title = "RUBIN"

    //dirty encoding of direct links to endorisk, and endorisk in dutch
    if (window.location.search === "?network=endorisk") {
      this.loadNetwork("endometrial cancer")
    }
    if (window.location.search === "?network=endorisk?lang=nl") {
          this.loadNetwork("endometrial cancer")
          this.$i18n.locale = "nl"
          // eslint-disable-next-line
          umami.track('language-change', {language: "nl", network: "endometrial cancer"} );
    }
  },
  data() {
    return {
      page: "chooseNet",
      selectedNetwork: null,
      localNet: null
    }
  },
  methods: {
      /**
       * Gets called when a predefined network is selected
       *
       * @param {string} selectedNet - the name of the selected network
       */
    loadNetwork(selectedNet) {
      this.page = 'interface'
      this.selectedNetwork = selectedNet
      this.localNet = null
      // eslint-disable-next-line
      umami.track('load_network', { type: 'predefined', network: selectedNet});
    },

      /**
       * Gets called when a network is uploaded from the user's file system
       *
       * @param {Object} localNet - The Object containing the network file information and content
       */
    loadLocalNet(localNet) {
      this.page = 'interface'
      this.selectedNetwork = localNet.name
      this.localNet = localNet
      // eslint-disable-next-line
      umami.track('load_network', { type: 'own', network: ''});
    }
  }
}


</script>

<style>
body, html {
  height: 100%;
  padding: 0;
  margin: 0;
  font-size: 16px
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  height:100%;
}


</style>
