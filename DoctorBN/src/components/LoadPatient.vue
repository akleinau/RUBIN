<template>
  <form @submit.prevent="read" id = "load-patient-form" enctype="multipart/form-data">
    <h3>Upload a patient case</h3>
    <input id = "patient-case" type = "file" accept=".csv" required/> <br>
    <input name = "patient-submit" type = "submit" value = "Load case"/>
  </form>
</template>

<script>
export default {
  name: "LoadPatient",
  data() {
    return {
      patient: {
        evidence:
      }
    }
  },
  methods: {
    load(patientData) {
      let type = ''
      for (var row in patientData) {
        if (row[0] === 'evidence') {

        }
      }
    },
    read() {
      let fileField = document.getElementById('patient-case')
      const csvFile = fileField.files[0];
      const reader = new FileReader();
      reader.onload = function (event) {
        const text = event.target.result;
        const patientData = this.csvToArray(text, ';')
        load(patientData)
      };
      reader.readAsText(csvFile);
    },
    csvToArray(str, delimiter) {
      const headers = ['type', 'node', 'value']
      const rows = str.slice(str.indexOf("\n") + 1).split("\n");
      return rows.map(function (row) {
        const values = row.split(delimiter);
        return headers.reduce(function (object, header, index) {
          object[header] = values[index];
          return object;
        }, {});
      });
    }
  }
}
</script>

<style scoped>

</style>