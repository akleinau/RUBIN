<template>
  <label> {{ $t("name") }}: </label>
  <InputText type="text" v-model="Store.patient.name"></InputText>
  <br><br>
  <div class="flex align-items-center justify-content-between">
    <FileUpload name="net-upload" url="./Patientupload" accept=".csv" :customUpload="true" chooseIcon="pi pi-upload"
                mode="basic" :auto=true :chooseLabel="$t('Upload')" @uploader="read($event)"
                class="flex"/>
    <Button :label="$t('Download')" @click="exportCSV()" icon="pi pi-download" class="flex"/>
    <Button label="pdf export" icon="pi pi-download" @click="exportPDF" class="p-button-secondary"/>
  </div>
</template>

<script>
import {useStore} from '@/store'
import {jsPDF} from 'jspdf'

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
    exportPDF() {
      let doc = new jsPDF({unit: 'px'})

      doc.setFontSize(40)
      doc.text(20, 20, 'Patient Summary')
      doc.setFontSize(20)
      doc.text(20, 30, 'Patient: ' + this.Store.patient.name)

      let evidence = this.Store.patient.evidence.map(x => {
        return {
          "Evidence": this.Store.labels[x.name],
          "option": this.Store.option_labels[x.name][x.selected.name]
        }
      })

      doc.table(20, 40, evidence, ['Evidence', 'option'], {autoSize: true})

      let goals = this.Store.patient.goals.map(x => {
        return {
          "Goal": this.Store.labels[x.name],
          "option": this.Store.option_labels[x.name][x.selected.name],
          "direction": x.direction
        }
      })

      doc.table(20, 100, goals, ['Goal', 'option', 'direction'], {autoSize: true})

      let targets = this.Store.patient.targets.map(x => {
        return {
          "Target": this.Store.labels[x.name]
        }
      })

      if (targets.length > 0) {
        doc.table(20, 160, targets, ['Target'], {autoSize: true})
      }

      doc.addPage()
      doc.text(20, 20, 'Predictions')

      let predictions = this.Store.predictions.options.map(x => {
        return {
          "option": JSON.stringify(x.option)
        }
      })

      doc.table(20, 30, predictions, ['option'], {autoSize: true})

      doc.addPage()

      let explanations = this.Store.explain.relevance.map(x => {
        return {
          "label": this.Store.labels[x.node_name],
          "overall relevance": x.overall_relevance.toFixed(2)
        }
      })

      doc.table(20, 30, explanations, ['label', 'overall relevance'], {autoSize: true})

      doc.save('export.pdf')

      /*let docHTML = new jsPDF()
      doc.html(document.querySelector("#optionsTable"), {
        callback: function (doc) {
          doc.save('exportHTML.pdf');
        },
        x: 10,
        y: 10,

      });

      */
    }
  }
}
</script>

<style scoped>

</style>