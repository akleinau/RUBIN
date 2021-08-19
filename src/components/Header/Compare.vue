<template>
  <DataTable :value="configurations" :autoLayout="true">
    <Column field="name">
    </Column>
    <Column>
      <template #body="slotProps">
        <Button class="p-mx-1 p-button-secondary" :label="$t('compare')" @click="compare(slotProps.data.name)"/>
        <Button class="p-mx-1 p-button-secondary" :label="$t('load')" @click="load(slotProps.data.name)"/>
        <Button class="p-mx-1 p-button-secondary" :label="$t('delete')" @click="deleteConfig(slotProps.data.name)"/>
      </template>
    </Column>
  </DataTable>
  <br>
  {{ $t("SaveConfig") }}:
  <form @submit.prevent="saveConfig">
    <InputText type="text" v-model="patientName" required/>
    <Button :label="$t('save')" @click="saveConfig()"></Button>
  </form>
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
  mounted() {
    this.updateStandardSaveName()
  },
  methods: {
    updateStandardSaveName() {
    let i = 1
    while (this.configurations.find(a => a.name === "save_" + i)) {
      i++
    }
    this.patientName = "save_" + i
    },
    saveConfig() {
      if (!this.configurations.find(a => a.name === this.patientName)) {
        this.showNameInput = false
        this.$emit("saveConfig", this.patientName)
        this.updateStandardSaveName()
      } else {
        alert(this.$t('ErrName'));
      }

    },
    load(name) {
      this.$emit("load", name)
    },
    compare(name) {
      this.$emit("compareTo", name)
    },
    deleteConfig(name) {
      this.$emit("deleteConfig", name)
    }
  }
}
</script>

<style scoped>

</style>