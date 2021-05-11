<template>
  <Panel header="Target" style="position: relative">
    <Button icon="pi pi-plus"></Button>
    <Listbox v-model="selectedCity" :options="cities" optionLabel="name">
      <template #option="slotProps">
        <div>
          {{ slotProps.option.name }}: {{slotProps.option.value}}
        </div>
      </template>
    </Listbox>
  </Panel>
</template>

<script>
export default {
  name: "Target",
  data() {
    return {
      selectedCity: null,
      cities: [
        {name: 'Therapy', value: 'radiotx'},
        {name: '1yr Survival', value: 'yes'},
        {name: '5yr Survival', value: 'yes'}
      ]
    }
  },
  methods: {
    getLabel(event) {
      return event.name + event.code;
    }
  }
}
</script>

<style scoped>

Button {
  position: absolute;
  right: 0%;
  top: 0%;
  margin: 5px;
}
</style>