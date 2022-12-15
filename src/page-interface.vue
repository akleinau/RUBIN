<template>

  <tutorial @setBlock="block = $event"/>

    <Header ref="menu" @changePage="changePage()"/>

    <!-- main cards -->
    <div class=" grid flex-column h-full relative">

      <BlockUI class="col-3 h-full" :blocked="block.evidence"> <!-- style="height:70%" -->
        <Evidence class="h-full"/>
      </BlockUI>

      <BlockUI class="col-5 h-full" :blocked="block.options">
        <Prediction class="h-full"/>
      </BlockUI>

      <BlockUI class="col-4 h-full" :blocked="block.explain">
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
        goals: false,
        evidence: true,
        options: true,
        explain: true
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
    this.Store.network = this.network
    this.Store.localNet = this.localNet
    await this.Store.loadNodes()
  }
}
</script>

<style lang="scss" scoped>

.grid {
  margin-top: 0;
  margin-bottom: 0;
  margin-right: 0
}

::v-deep(.p-card-content) {
  height: 90% !important;
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