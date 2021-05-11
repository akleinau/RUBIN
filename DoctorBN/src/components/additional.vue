<template>

  <ScrollPanel style="width: 100%; height: 100%">
    <Menu :model="items" v-if="view ==='menu'" style="width: 100%; height: 100%"/>
    <div v-if="view !== 'menu'">
      <h2> {{ label(view) }}
        <Button label="back" class="p-button-sm" @click="view='menu'"></Button>
      </h2>
    </div>
    <div id="network" v-if="view === 'network'">
      The endometrial cancer network
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
      dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita
      kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur
      sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
      voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
      sanctus est Lorem ipsum dolor sit amet.
    </div>
    <div id="pubmed" v-if="view === 'pubmed'">pubmed</div>
    <div id="change" v-if="view === 'change'">
      <Change/>
    </div>
    <div id="compare" v-if="view === 'compare'">
      <Compare/>
    </div>
    <div id="feedback" v-if="view === 'feedback'">
      <Feedback/>
    </div>

  </ScrollPanel>
</template>

<script>
import Feedback from './additional/Feedback.vue'
import Compare from './additional/Compare.vue'
import Change from './additional/Change.vue'

export default {
  name: "additional",
  components: {
    Feedback,
    Compare,
    Change
  },
  data() {
    return {
      view: "menu",
      items: [
        {
          label: 'Network description', command: () => {
            this.view = "network"
          }
        },
        {
          label: 'Pubmed', command: () => {
            this.view = "pubmed"
          }
        },
        {
          label: 'How can I change the result?', command: () => {
            this.view = "change"
          }
        },
        {
          label: 'Compare to saved configurations', command: () => {
            this.view = "compare"
          }
        },
        {
          label: 'send feedback', command: () => {
            this.view = "feedback"
          }
        }
      ]
    }
  },
  methods: {
    label(name) {
      switch (name) {
        case "network":
          return "Network description";
        case "pubmed":
          return "PubMed";
        case
        "change":
          return "How can I change the result?";
        case
        "compare":
          return "Compare";
        case
        "feedback":
          return "Send feedback";
      }
    }
  }
}
</script>

<style scoped>
#additional {
  background-color: white;
}

div {
  background-color: white;
  width: 100%
}

Button {
  float: right;
  margin-right: 10px
}


</style>

<style>

.p-accordion-header {
  font-size: 10px;
}

.hide {
  display: None;
}

</style>