<template>

  <ScrollPanel style="position: relative; width: 100%; height: 100%">
    <Menu :model="items" v-if="view ==='menu'" style="width: 100%"/>
    <div v-if="view !== 'menu'">
        <Button label="back" class="p-button-sm" @click="view='menu'" style="position:absolute; right:5%; margin: 5px" />
    </div>
    <Panel id="network" v-if="view === 'network'" header="The endometrial cancer network">
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
      dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita
      kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur
      sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
      voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
      sanctus est Lorem ipsum dolor sit amet.
    </Panel>
    <Panel id="pubmed" v-if="view === 'pubmed'" header="pubmed"></Panel>
    <Panel id="change" v-if="view === 'change'" header='How can I change the result?'>
      <Change/>
    </Panel>
    <Panel id="compare" v-if="view === 'compare'" header="'Compare to saved configurations'">
      <Compare/>
    </Panel>
    <Panel id="feedback" v-if="view === 'feedback'" header="Send feedback">
      <Feedback/>
    </Panel>

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

Button {
  float: right;
  margin-right: 10px
}


</style>
