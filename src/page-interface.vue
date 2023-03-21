<template>

  <tutorial @setBlock="block = $event" :loading="Store.optionsLoading || Store.explanationLoading"/>

    <Header ref="menu" @changePage="changePage()"/>

    <!-- main cards -->
    <div class=" grid w-full h-full relative">

      <BlockUI class="xl:col-3 lg:col-3 md:col-3 col-12 h-full" :blocked="block.evidence"> <!-- style="height:70%" -->
        <Evidence class="h-full"/>
      </BlockUI>

      <BlockUI class="xl:col-4 lg:col-4 md:col-4 col-12 h-full" :blocked="block.options">
        <Prediction class="h-full"/>
      </BlockUI>

      <BlockUI class="xl:col-5 lg:col-5 md:col-5 col-12 h-full" :blocked="block.explain">
        <Explanation class="h-full"/>
      </BlockUI>
    </div>


</template>

<script>
import Header from "./components/page-header";
import Explanation from "./components/page-explanation";
import Prediction from "@/components/page-prediction";
import Evidence from "@/components/page-evidence";
import tutorial from "@/components/page-tutorial";
import {useStore} from '@/store'

export default {
  name: "page-interface",
  emits: ["changePage"],
  components: {
    Header,
    Explanation,
    Prediction,
    Evidence,
    tutorial
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
      },
    }
  },
  methods: {
    changePage() {
      this.$emit("changePage")
    },
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
  height: 90% !important;
}

::v-deep(.p-card-body) {
  height: 100% !important;
  padding-bottom: 0;
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