<template>
  <DataTable :value="results" class="p-datatable-sm" :autoLayout="true"
             :dataKey="option" selectionMode="single" v-model:selection="selected"
             @rowSelect="update" @rowUnselect="update">
    <Column field="option">
      <template #body>
        <div>{{ $t("noInterventions")}}</div>
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

<style lang="scss" scoped>
::v-deep(.p-highlight) {
  background-color: rgba(55, 55, 55, 0.15) !important;
}
</style>