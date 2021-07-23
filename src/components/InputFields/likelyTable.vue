<template>
  <DataTable :value="results" class="p-datatable-sm" :autoLayout="true"
             dataKey="option" selectionMode="single" v-model:selection="selected"
             @rowSelect="update" @rowUnselect="update">
    <Column field="option">
      <template #body>
        <div>no interventions</div>
      </template>
    </Column>
  </DataTable>
</template>

<script>

export default {
  name: "likelyTable",
  emits: ["update"],
  data() {
    return {
      "selected": null,
      optionCount: 0,
    }
  },
  props: [
    "results",
    "goals",
    "selectedOption",
    "labels"
  ],
  watch: {
    selectedOption: function () {
      this.selected = this.selectedOption
    },
  },
  methods: {
    update() {
      this.$emit("update", this.selected);
    },
  }
}
</script>

<style scoped>

</style>