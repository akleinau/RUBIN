<template>
  <Listbox v-model="selectedConfig" :options="configs" optionLabel="name"/>
  <Button style="width: 90%" label="Save configuration"></Button>
</template>

<script>
export default {
  name: "Compare.vue",
  data() {
    return {
      selectedConfig: null,
      configs: [
        {name: 'save 1', code: 'NY'},
        {name: 'save 2', code: 'RM'},
        {name: 'save 3', code: 'LDN'}
      ]
    }
  }
}
</script>

<style scoped>

</style>