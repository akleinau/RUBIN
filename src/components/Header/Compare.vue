<template>
  {{$t("configurationsHelp")}}
  <br><br>
  <Menu :model="menu"  :scrollable="true"
           scrollHeight="300px" selectionMode="single"/>
  <br>
  {{ $t("SaveConfig") }}:
    <form @submit.prevent="saveConfig">
      <InputText type="text" v-model="patientName" required />
      <Button  :label="$t('save')" @click="saveConfig()"></Button>
    </form>

   <OverlayPanel ref="loadOverlay">
    <Button class="p-mx-1 p-button-secondary" :label="$t('compare')" @click="compare()"/>
    <Button class="p-mx-1 p-button-secondary" :label="$t('load')" @click="load()"/>
     <Button class="p-mx-1 p-button-secondary" :label="$t('delete')" @click="deleteConfig()"/>
  </OverlayPanel>

</template>

<script>
export default {
  name: "Compare.vue",
  emits: ["saveConfig", "load", "compareTo", "deleteConfig"],
  props: [
    "configurations"
  ],
  data() {
    return {
      selected: null,
      showNameInput: false,
      patientName: "save_1"
    }
  },
  computed: {
    menu: function() {
      let menu = []
      this.configurations.forEach(a => {
        menu.push( {
          label: a.name,
          command: (event) => this.select(event.originalEvent, a.name)
        })
      })
      return menu
    }
  },
  mounted() {
    let i = 1
      while (this.configurations.find(a => a.name === "save_"+i)) {
        i++
      }
      this.patientName = "save_" + i
  },
  methods: {
    saveConfig() {
      if (! this.configurations.find(a => a.name === this.patientName)) {
        this.showNameInput = false
        this.$emit("saveConfig", this.patientName)
      }
      else {
        alert(this.$t('ErrName'));
      }

    },
    select(event, name) {
      //this.$emit("compareTo", this.selected.name)
      this.$refs.loadOverlay.toggle(event)
      this.selected = name
    },
    load() {
      this.$emit("load", this.selected)
    },
    compare() {
      this.$emit("compareTo", this.selected)
    },
    deleteConfig() {
      this.$emit("deleteConfig", this.selected)
    }
  }
}
</script>

<style scoped>

</style>