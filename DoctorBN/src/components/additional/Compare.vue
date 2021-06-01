<template>
  <Listbox :options="configurations" optionLabel="name" :scrollable="true"
           scrollHeight="300px" selectionMode="single" v-model="selected" @change="select"/>
  <br>
    Save new configuration:
    <form @submit.prevent="saveConfig">
      <InputText type="text" v-model="patientName" required />
      <Button  label="Save configuration" @click="saveConfig()"></Button>
    </form>

</template>

<script>
export default {
  name: "Compare.vue",
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
  mounted() {
    let i = 1
      while (this.configurations.find(a => a.name === "save_"+i)) {
        i++
      }
      this.patientName = "save_" + i
  },
  methods: {
    clicked() {
      this.showNameInput = true
    },
    saveConfig() {
      if (! this.configurations.find(a => a.name === this.patientName)) {
        this.showNameInput = false
        this.$emit("saveConfig", this.patientName)
      }
      else {
        alert("ERROR: The name already exists, try again");
      }

    },
    select() {
      this.$emit("compareTo", this.selected.name)
    }
  }
}
</script>

<style scoped>

</style>