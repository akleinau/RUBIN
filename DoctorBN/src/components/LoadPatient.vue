<template>
  <form @submit.prevent="read" id = "load-patient-form" enctype="multipart/form-data">
    <h3>Upload a patient case</h3>
    <input id = "patient-case" type = "file" accept=".csv" required/> <br>
    <input name = "patient-submit" type = "submit" value = "Load case"/>
  </form>
  <input id="storeStr" type="text" hidden>
</template>

<script>
export default {
  name: "LoadPatient",
  data() {
    return {
      patient: {
        evidence: [],
        targets: [],
        goals: []
      }
    }
  },
  methods: {
    read() {
      let fileField = document.getElementById('patient-case')
      const csvFile = fileField.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const str = event.target.result
        const delimiter = '; '
        const headers = ['type', 'name', 'option']
        const rows = str.slice(str.indexOf("\n") + 1).split("\n");
        const patientData = rows.map(function (row) {
          const values = row.split(delimiter);
          return headers.reduce(function (object, header, index) {
            object[header] = values[index];
            return object;
          }, {});
        });
        this.load(patientData)
      }
      reader.readAsText(csvFile)
    },
    load(patientData) {
      for (var row in patientData) {
        let item = patientData[row]
        let node = {
          name: item.name,
          option: item.option
        }
        if (item.type === 'evidence') {
          console.log(this)
          this.patient.evidence.push(node)
        } else if (item.type === 'goal') {
          this.patient.goals.push(node)
        } else if (item.type === 'target') {
          this.patient.targets.push({
            name: item.name
          })
        }
      }
      this.$emit('loaded', this.patient)
    }
  }
}
</script>

<style scoped>

</style>



addEvidences(nodes) {
      nodes.forEach(node => {
        this.evidence.push(node)
        this.nodes = this.nodes.filter(x => x.name !== node.name)
      })
      this.calculate()
    },