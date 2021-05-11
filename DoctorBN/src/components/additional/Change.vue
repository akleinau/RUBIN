<template>
  <h3>Target value: No
    <Button label="choose different"></Button>
  </h3>
  change one of these:
  <Listbox v-model="selectedTarget" :options="targets" optionLabel="name"/>
  <Button style="width: 90%" label="add changeable evidence"></Button>
</template>

<script>
export default {
  name: "Change",
  data() {
    return {
      selectedTarget: null,
      targets: [
        {name: "no"},
        {name: "radiotx"},
        {name: "chemotx"}
      ]
    }
  }
}
</script>

<style scoped>

</style>