<template>
  <label> {{ $t("name") }}: </label>
  <InputText type="text" v-model="Store.patient.name"></InputText>
  <br><br>
  <div class="flex align-items-center justify-content-between">
    <FileUpload name="net-upload" url="./Patientupload" accept=".csv" :customUpload="true" chooseIcon="pi pi-upload"
                mode="basic" :auto=true :chooseLabel="$t('Upload')" @uploader="read($event)"
                class="flex"/>
    <Button :label="$t('save')" @click="exportCSV()" icon="pi pi-download" class="flex"/>
  </div>
</template>

<script>
import {useStore} from '@/store'

export default {
  name: "load-patient",
  emits: ["loaded"],
  setup() {
    const Store = useStore()
    return {Store}
  },
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
    read(fileField) {
      const csvFile = fileField.files[0];
      const name = csvFile.name.replace('.csv', '')
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
        this.load(patientData, name)
      }
      reader.readAsText(csvFile)
    },
    getCorrespondingNode(nodeArr) {
      let correspondingNodes = []
      nodeArr.forEach(node => {
        let correspondingNode = this.Store.patient.nodes.find(x => x.name === node.name)
        if (correspondingNode == null) console.log(node)
        let item = {
          name: correspondingNode.name,
          selected: {name: node.option},
          options: correspondingNode.options
        }
        correspondingNodes.push(item)
      })
      return correspondingNodes
    },
    async load(patientData, name) {
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
      await this.Store.reset(true)

      let evidenceNodes = this.getCorrespondingNode(this.patient.evidence)
      let targetNodes = this.getCorrespondingNode(this.patient.targets)
      let goalNodes = this.getCorrespondingNode(this.patient.goals)
      this.Store.addEvidences(evidenceNodes)
      this.Store.addTargets(targetNodes)
      this.Store.addGoals(goalNodes)
      this.Store.patient.name = name
      console.log("Patient: " + name)
      this.$emit('loaded')
    },
    exportCSV() {
      const csv = this.Store.createCSVcontent();

      const anchor = document.createElement('a');
      anchor.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
      anchor.target = '_blank';
      anchor.download = this.Store.patient.name + '.csv';
      anchor.click();
    },
  }
}
</script>

<style scoped>

</style>