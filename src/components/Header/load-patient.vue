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
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.pdfMake.vfs;


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

      let data = {
        content: [],
        styles: {
          table: {
            margin: [0, 5, 0, 15]
          },
          header: {
            fontSize: 18,
            bold: true
          },
          subheader: {
            fontSize: 15,
            bold: true
          },
        }
      }

      data.content.push({
        text: this.Store.network + ' - Patient Summary',
        style: 'header'
      })

      data.content.push({
        text: 'Patient: ' + this.Store.patient.name,
        style: 'subheader'
      })

      data.content.push("  ")

      //evidence
      let evidence = [["evidence", "option"]]
      this.Store.patient.evidence.map(x => {
        evidence.push([this.Store.labels[x.name],
          this.Store.option_labels[x.name][x.selected.name]
        ])
      })

      data.content.push({text: "Evidence", style: 'subheader'})
      data.content.push({style: "table", table: {body: evidence}})


      //goals
      let goals = [["goal", "option", "direction"]]
      this.Store.patient.goals.map(x => {
        goals.push([
          this.Store.labels[x.name],
          this.Store.option_labels[x.name][x.selected.name],
          x.direction
        ])
      })

      data.content.push({text: "Goals", style: 'subheader'})
      data.content.push({style: "table", table: {body: goals}})

      //targets
      let targets = [["variable"]]
      this.Store.patient.targets.map(x => {
        targets.push([this.Store.labels[x.name]])
      })

      data.content.push({text: "Targets", style: 'subheader'})
      data.content.push({style: "table", table: {body: targets}})


      data.content.push({text: "Predictions", style: 'subheader'})

      //predictions
      let predictionsHeader = ["option"]

      for (const goal of this.Store.patient.goals) {
        predictionsHeader.push(this.Store.labels[goal.name])
      }

      let predictions = [predictionsHeader]
      this.Store.predictions.options.map(x => {
        let out = [JSON.stringify(x.option)]

        for (const value of Object.values(x.goalValues)) {
          out.push(value.toFixed(2))
        }

        predictions.push(out)
      })


      data.content.push({style: "table", table: {body: predictions}})

      //Explanations
      data.content.push({text: "Explanations", style: 'subheader'})

      let explanationsHeader = ["variable", "relevance"]

      for (const goal of this.Store.patient.goals) {
        explanationsHeader.push(this.Store.labels[goal.name])
      }

      let explanations = [explanationsHeader]
      this.Store.explain.relevance.map(x => {
        let out = [
          this.Store.labels[x.node_name],
          x.overall_relevance.toFixed(2)
        ]

        for (const value of Object.values(x.relevancies)) {
          out.push(value.toFixed(2))
        }

        explanations.push(out)
      })

      data.content.push({style: "table", table: {body: explanations}})


      pdfMake.createPdf(data).open();

    }
  }
}
</script>

<style scoped>

</style>