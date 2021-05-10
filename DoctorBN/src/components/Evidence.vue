<template>
<Panel header="Evidence">
  <Listbox v-model="selectedCity" :options="cities" optionLabel="name" />
</Panel>
</template>

<script>
export default {
  name: "Evidence",
  data() {
    return {
      selectedCity: null,
      cities: [
        {name: 'LVSI', code: 'NY'},
        {name: 'LNM', code: 'RM'},
        {name: 'PostGrade', code: 'LDN'}
      ]
    }
  }
}
</script>

<style scoped>
#evidence {
  background-color: white;
}
</style>