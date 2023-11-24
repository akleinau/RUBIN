<template>
  <div class="flex flex-column min-h-screen" :style="{'background-color': Store.backgroundColor}">

  <tutorial @setBlock="block = $event" :loading="Store.optionsLoading || Store.explanationLoading"/>

    <Header ref="menu" @changePage="changePage()"/>

    <Dialog v-model:visible="stepIsMinus1" :closable="false" modal>
      <ProgressSpinner />
    </Dialog>

    <div class="flex text-white-alpha-80 justify-content-center pr-3 pt-1 pb-1 mx-1  bg-purple-800 border-round">
        DISCLAIMER: This user interface is still under development!
    </div>

    <!-- main cards -->
    <div class="grid w-full relative">

      <BlockUI class="xl:col-4 lg:col-4 col-12" :blocked="block.evidence" style="height:90vh">
        <Evidence/>
      </BlockUI>

      <BlockUI class="xl:col-4 lg:col-4 col-12" :blocked="block.options" style="height:90vh">
        <Prediction/>
      </BlockUI>

      <BlockUI class="xl:col-4 lg:col-4 col-12" :blocked="block.explain" style="height:90vh">
        <Explanation/>
      </BlockUI>
    </div>

    <FooterComponent/>

</div>

</template>

<script>
import Header from "./components/page-header.vue";
import Explanation from "./components/page-explanation.vue";
import Prediction from "@/components/page-prediction.vue";
import Evidence from "@/components/page-evidence.vue";
import tutorial from "@/components/page-tutorial.vue";
import FooterComponent from "@/components/footer-component.vue";
import {useStore} from '@/store'

export default {
  name: "page-interface",
  emits: ["changePage"],
  components: {
    Header,
    Explanation,
    Prediction,
    Evidence,
    tutorial,
    FooterComponent
  },
  props: [
    "network", "localNet"
  ],
  setup() {
    const Store = useStore()
    return {Store}
  },
  data() {
    return {
      block: {
        evidence: false,
        options: false,
        explain: false
      }
    }
  },
  methods: {
    changePage() {
      this.$emit("changePage")
    },
  },
  computed : {
    stepIsMinus1: function () {
      return this.Store.tutorialStep === -1
    }
  },
  mounted: async function () {
    this.Store.language = this.$i18n.locale
    this.Store.localNet = this.localNet
    await this.Store.loadNodes()
  },
  created: async function () {
    this.Store.network = this.network
  }
}
</script>

<style lang="scss" scoped>

.grid {
  margin: 0;
  padding: 0;
}

::v-deep(.p-card-content) {
  height: 100% !important;
}

::v-deep(.p-card-body) {
  height: 100% !important;
}

#arrow {
  width: 100%;
  height: 30%;
}

::v-deep(.p-scrollpanel) {
  .p-scrollpanel-bar {
    background-color: #b3b3b3;
    opacity: 1;
    transition: background-color .2s;
  }

}

</style>