<template>
  <Panel header="Target">
    <Button icon="pi pi-plus"></Button>
    <Listbox v-model="selectedCity" :options="cities" optionLabel="name"/>
  </Panel>
</template>

<script>
export default {
  name: "Target",
  data() {
    return {
      selectedCity: null,
      cities: [
        {name: 'Therapy', code: 'NY'},
        {name: '1yr Survival', code: 'RM'},
        {name: '5yr Survival', code: 'LDN'}
      ]
    }
  }
}
</script>

<style scoped>
#targets {
  background-color: white;
}

Button {
  position: absolute;
  top: 8%;
  left: 30%
}
</style>