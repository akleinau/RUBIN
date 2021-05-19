<template>
  <h3>Target value: No
    <Button label="choose different"></Button>
  </h3>
  change one of these:
  <Listbox v-model="selectedTarget" :options="targets" optionLabel="name">
     <template #option="slotProps">
        <div>
          {{ slotProps.option.name }} to {{slotProps.option.value}}
        </div>
      </template>
  </Listbox>
  <Button style="width: 90%" label="add changeable evidence"></Button>
</template>

<script>
export default {
  name: "Change",
  data() {
    return {
      selectedTarget: null,
      targets: [
        {name: "LVSI", value: "negative"},
        {name: "LNM", value: "no"},
        {name: "PostGrade", value: "grade_1"}
      ]
    }
  }
}
</script>

<style scoped>

</style>