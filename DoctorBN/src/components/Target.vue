<template>
  <div style="position:relative">
  <Panel header="Target">

    <Listbox v-model="selected" :options="targets" optionLabel="name" @change="onTargetChange()">
      <template #option="slotProps">
        <div>
          {{ slotProps.option.name }}: {{slotProps.option.value}}
        </div>
      </template>
    </Listbox>
  <Button id="AddButton" icon="pi pi-plus"></Button>
  </Panel>

</div>
</template>

<script>
export default {
  name: "Target",
  data() {
    return {
      selected: null,
      targets: [
        {name: 'Therapy', value: 'radiotx'},
        {name: '1yr Survival', value: 'yes'},
        {name: '5yr Survival', value: 'yes'}
      ]
    }
  },
  methods: {
    getLabel(event) {
      return event.name + event.code;
    },
    onTargetChange() {
      this.$emit("setTarget", this.selected);
    }
  }
}
</script>

<style scoped>

#AddButton {
  width: 100%
}
</style>