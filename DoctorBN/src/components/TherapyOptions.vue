<template>
<Panel header="Options" style="margin-bottom: 10px">
   <DataTable :value="results" :scrollable="true" scrollHeight="300px"
                 dataKey="id" v-if="showTable">
        <Column header="option" field="option" />
     <Column header="value" field="value" />
     <Column header="goalValues" field="goalValues" >
     </Column>
   </DataTable>
  <img src="../assets/options.png" style="width: 100%" v-else>
    <Button label="toggle" @click="showTable = !showTable"></Button>
</Panel>
</template>

<script>
export default {
name: "TherapyOptions",
  props: [
      "results"
  ],
  data() {
  return {
    showTable: true
  }
  }
}
</script>

<style scoped>

</style>