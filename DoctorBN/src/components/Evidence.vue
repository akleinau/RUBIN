<template>
  <DataTable :value="items" responsiveLayout="scroll">
    <Column field="name" header="Evidence"></Column>
    <Column field="value">
      <template #body="slotProps">
        <Dropdown v-model="slotProps.data.selected" :options="slotProps.data.options" optionLabel="name"
                  placeholder="slotProps.data.selected">
        </Dropdown>
      </template>
    </Column>
  </DataTable>
  <Button icon="pi pi-plus" @click="overlay = true"></Button>
  <Dialog header="Add Evidence" v-model:visible="overlay">
    <Listbox v-model="selected" :options="items" optionLabel="name"/>
  </Dialog>
</template>

<script>
export default {
  name: "Evidence",
  data() {
    return {
      overlay: false,
      selected: null,
      items: [
        {
          name: 'LVSI',
          value: 'positive',
          selected: {name: 'positive'},
          options: [{name: 'positive'}, {name: 'negative'}]
        },
        {name: 'LNM', value: 'yes', selected: {name: 'yes'}, options: [{name: 'yes'}, {name: 'no'}]},
        {
          name: 'PostGrade',
          value: 'grade_2',
          selected: {name: 'grade_2'},
          options: [{name: 'grade_1'}, {name: 'grade_2'}, {name: 'grade_3'}]
        }
      ]
    }
  }
}
</script>

<style scoped>
#evidence {
  background-color: white;
}

Button {
  position: absolute;
  top: 8%;
  left: 13%
}

</style>