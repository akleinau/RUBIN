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
        evidence: [],
        targets: [],
        goals: [],
      }
    }
  },
  methods: {
    load(patientData) {
      for (var row in patientData) {
        let node = {
            'name': row[1],
            'option': row[2]
        }
        if (row[0] === 'evidence') {
          this.evidence.push(node)
        } else if (row[0] === 'target') {
          this.targets.push(node)
        } else {
          this.goals.push(node)
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
        console.log(patientData)
        this.load(patientData)
      };
      reader.readAsText(csvFile);
    },
    csvToArray(str, delimiter) {
      const headers = ['type', 'name', 'option']
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