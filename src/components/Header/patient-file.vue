<template>
  <label> {{ $t("name") }}: </label>
  <br>
  <InputText type="text" v-model="PatientStore.name"></InputText>
  <br><br>
  <div class="flex juistify-content-center flex-column align-items-stretch">
    <Button :label="$t('pdfExport')" icon="pi pi-file-pdf" @click="exportPDF" class="mb-4"/>
    <Button :label="$t('FileDownload')" @click="exportCSV()" icon="pi pi-download" class="flex p-button-secondary mb-2"/>
    <FileUpload name="net-upload" url="./Patientupload" accept=".csv" :customUpload="true" chooseIcon="pi pi-upload"
                mode="basic" :auto=true :chooseLabel="$t('FileUpload')" @uploader="readFile($event)"
                class="flex p-button-secondary mb-2"/>

    <Button :label="$t('textUpload')" @click="TextUploadDialog = !TextUploadDialog" icon="pi pi-pencil"
            class=" flex p-button-secondary"/>
  </div>
  <div v-if="TextUploadDialog">
    <Textarea v-model="csvText" rows="5" class="mt-2 mb-2"/>
    <br>
    <Button label="upload" @click="readText"/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {useStore} from '../../store.ts';
import {usePatientStore} from "../../stores/patient_store.ts";
import * as barvisjs from "../visualisations/bar-vis-js.ts";
import * as twosidedbarvisjs from "../visualisations/two-sided-bar-vis-js.ts";
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import {NNode} from "../../types/node_types.ts";

pdfMake.vfs = pdfFonts && pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : globalThis.pdfMake.vfs;


export default defineComponent({
  name: "patient-file",
  emits: ["loaded"],
  setup() {
    const Store = useStore()
    const PatientStore = usePatientStore()
    return {Store, PatientStore}
  },
  data() {
    return {
      patient: {
        evidence: [],
        targets: [],
        goals: []
      },
      TextUploadDialog: false,
      csvText: ""
    }
  },
  methods: {
    /**
     * reads text when it is entered directly via textbox
     */
    readText() {
      console.log(this.csvText)
      this.read(this.csvText, "")
    },
    /**
     * reads file content uploaded
     *
     * @param fileField
     */
    readFile(fileField) {
      const csvFile = fileField.files[0];
      const name = csvFile.name.replace('.csv', '')
      const reader = new FileReader();
      reader.onload = (event) => {
        this.read(event.target.result, name)
      }
      reader.readAsText(csvFile)
    },
    /**
     * reads string patient configuration and converts it to patient data
     *
     * @param str
     * @param name
     */
    read(str, name) {

      // eslint-disable-next-line
      umami.track("button-csv-upload", {network: this.Store.network} )

      const delimiter = '; '
      const headers = ['type', 'name', 'option', 'direction']
      const rows = str.slice(str.indexOf("\n") + 1).split("\n");
      const patientData = rows.map(function (row) {
        const values = row.split(delimiter);
        return headers.reduce(function (object, header, index) {
          object[header] = values[index];
          return object;
        }, {});
      });
      this.load(patientData, name)

    },
    /**
     * returns node objects corresponding to array of node names
     *
     * @param nodeArr
     * @param type
     * @returns {*[]}
     */
    getCorrespondingNode(nodeArr, type) {
      let correspondingNodes = [] as NNode[]
      nodeArr.forEach(node => {
        let correspondingNode = this.PatientStore.nodes.find(x => x.name === node.name)
        if (correspondingNode == null) console.log("Not found: " + node)
        let item = {
          name: correspondingNode.name,
          selected: {name: node.option, node: node.name},
          options: correspondingNode.options.map(option => { return {
            "name": option.name,
            "node": correspondingNode.name
            }
          })
        }
        if (type === "evidence") item.group = this.Store.evidenceGroupMap === null ? "" : this.Store.evidenceGroupMap[node.name]
        if (type === "goal") item.direction = node.direction

        correspondingNodes.push(item)
      })
      return correspondingNodes
    },

    /**
     * loads patient data as current patient configuration
     *
     * @param patientData
     * @param name
     * @returns {Promise<void>}
     */
    async load(patientData, name: string) {
      for (var row in patientData) {
        let item = patientData[row]
        if (item.type === 'evidence') {
          this.patient.evidence.push({
          name: item.name,
          option: item.option
        })
        } else if (item.type === 'goal') {
          this.patient.goals.push({
            name: item.name,
            option: item.option,
            direction: item.direction
          })
        } else if (item.type === 'target') {
          this.patient.targets.push({
            name: item.name
          })
        }
      }
      await this.Store.reset(true)

      this.Store.currentPhase = null

      let evidenceNodes = this.getCorrespondingNode(this.patient.evidence, "evidence")
      let targetNodes = this.getCorrespondingNode(this.patient.targets, "target")
      let goalNodes = this.getCorrespondingNode(this.patient.goals, "goal")
      this.Store.addEvidences(evidenceNodes)
      this.Store.addTargets(targetNodes)
      this.Store.addGoals(goalNodes)
      this.PatientStore.name = name
      this.Store.calculate()
      this.$emit('loaded')
    },
    /**
     * exports current patient configuration as csv file
     */
    exportCSV() {

      // eslint-disable-next-line
      umami.track("button-csv-download", {network: this.Store.network} )

      const csv = this.PatientStore.createCSVcontent();

      const anchor = document.createElement('a');
      anchor.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
      anchor.target = '_blank';
      anchor.download = this.PatientStore.name + '.csv';
      anchor.click();
    },
    /**
     * exports current data as pdf document
     */
    async exportPDF() {

      // eslint-disable-next-line
      umami.track("button-pdf-export", {network: this.Store.network} )

      let data = {
        content: [],
        styles: {
          table: {
            margin: [0, 5, 0, 15],
            alignment: 'center'
          },
          header: {
            fontSize: 18,
            bold: true,
            alignment: 'center'
          },
          subheader: {
            fontSize: 15,
            bold: true
          },
        }
      }

      // load svg logo
      let rubin_logo =  document.getElementById("logoRUBIN")
      var rubin_canvas = document.createElement('canvas');
        rubin_canvas.width = rubin_logo.width*3;
        rubin_canvas.height = rubin_logo.height*3;
        rubin_canvas.getContext('2d').drawImage(rubin_logo, 0, 0);
      rubin_canvas.toDataURL('image/png')

      if (this.Store.network === "endometrial cancer") {

        let endorisk_logo = document.getElementById("logoENDORISK")
        var endorisk_canvas = document.createElement('canvas');
        endorisk_canvas.width = endorisk_logo.width * 5.3;
        endorisk_canvas.height = endorisk_logo.height * 5.9;
        // its way too big, so we need to scale it down
        endorisk_canvas.getContext('2d').scale(0.20, 0.20);
        endorisk_canvas.getContext('2d').drawImage(endorisk_logo, 0, 60);
        // its way too big, so we need to scale it down

        endorisk_canvas.toDataURL('image/png')

        data.content.push({
          alignment: "right", marginBottom: 15, marginLeft: 280, columns: [
            {image: endorisk_canvas.toDataURL('image/png'), width: endorisk_logo.width + 15, alignment: 'right'},
            {image: rubin_canvas.toDataURL('image/png'), width: rubin_logo.width, alignment: 'left'},
          ]
        })

      } else {
        data.content.push({
          alignment: "right", marginBottom: 15, marginLeft: 380, columns: [
            {image: rubin_canvas.toDataURL('image/png'), width: rubin_logo.width + 15, alignment: 'right'},
          ]
        })
      }


      data.content.push({
        text: this.capitalize(this.Store.network) + ' - RUBIN ' + this.$t('CaseSummary'),
        style: 'header'
      });

      data.content.push({
        text: this.$t('Patient') + ': ' + this.PatientStore.name,
        style: 'subheader'
      })

      if (this.Store.partOfStudy) {

        let endoriskId = await this.Store.generate_endorisk_id()

        console.log("Endorisk ID: " + endoriskId)

        data.content.push({
          text: "ENDORISK ID" + ': ' + endoriskId,
          style: 'subheader'
        })

      }


      data.content.push("  ")

      this.pdf_add_predictions(data)
      this.pdf_add_evidence(data)
      this.pdf_add_goals(data)
      this.pdf_add_targets(data)
      data.content.push({text: "", pageBreak: 'after'})
      this.pdf_add_explanations(data)

      pdfMake.createPdf(data).open()

    },
    /**
     * capitalizes each first letter of every word in a sentence
     *
     * @param string
     * @returns {*}
     */
    capitalize(string) {
      return string.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    },

    /**
     * helper function to create pdf table out of given data
     *
     * @param data
     * @returns {Object}
     */
    pdfTable(data) {
      let Ncolumn = data[0].length

      let widths = [150]
      for (let i = 1; i < Ncolumn; i++) {
        widths.push('auto')
      }

      return {
        style: "table",
        table: {
          headerRows: 1,
          widths: widths,
          body: data
        },
        layout:
            {
              hLineWidth: function (i, node) {
                if (i === 1) return 2;
                if (i === 0 || i === node.table.body.length) return 0;
                return 1;
              }
              ,
              vLineWidth: function (i, node) {
                return ((i === 0 || i === node.table.widths.length)) ? 0 : 1;
              }
              ,
              hLineColor: function (i) {
                return (i === 1) ? 'black' : 'gray';
              }
              ,
              vLineColor: function () {
                return 'gray';
              }
              ,
            }
      }
    },

    /**
     * adds evidence info to pdf
     *
     * @param data
     */
    pdf_add_evidence(data) {
      let evidence = [[this.$t("Node"), ""]]
      this.PatientStore.evidence.map(x => {
        evidence.push([this.Store.labels.nodes[x.name],
          this.Store.labels.states[x.name][x.selected.name]
        ])
      })

      data.content.push({text: this.$t("Evidence"), style: 'subheader'})
      data.content.push(this.pdfTable(evidence))
    },

    /**
     * addds goal info to pdf
     *
     * @param data
     */
    pdf_add_goals(data) {
      let goals = [[this.$t("Node"), "", ""]]
      this.PatientStore.goals.map(x => {
        goals.push([
          this.Store.labels.nodes[x.name],
          this.Store.labels.states[x.name][x.selected.name],
          "(" + this.$t(x.direction) +")"
        ])
      })

      data.content.push({text: this.$t("DesiredOutcomes"), style: 'subheader'})
      data.content.push(this.pdfTable(goals))
    },

    /**
     * adds target info to pdf
     *
     * @param data
     */
    pdf_add_targets: function (data) {
      if (this.PatientStore.targets.length > 0) {
        let targets = [[this.$t("Node")]]
        this.PatientStore.targets.map(x => {
          targets.push([this.Store.labels.nodes[x.name]])
        })

        data.content.push({text: this.$t("Interventions"), style: 'subheader'})
        data.content.push(this.pdfTable(targets))

      }
    },

    /**
     * adds prediction info to pdf
     *
     * @param data
     */
    pdf_add_predictions(data) {
      data.content.push({text: this.$t("Treatment"), style: 'subheader'})
      let predictionsHeader = [""]

      for (const goal of this.PatientStore.goals) {
        predictionsHeader.push(this.Store.labels.nodes[goal.name] + ": " +
            this.Store.labels.states[goal.name][goal.selected.name])
      }

      let predictions = [predictionsHeader]
      this.Store.predictions.options.map(x => {
        let outOption = ""
        for (const [node, option] of Object.entries(x.option)) {
          outOption += this.Store.labels.nodes[node] + ": " + this.Store.labels.states[node][option] + "\n"
        }

        if (outOption === "") {
          outOption = this.$t("noInterventions")
        }

        if (x === this.Store.predictions.selectedOption) {
          outOption = {text: outOption, bold: true}
        }

        let out = [outOption]
        const width = 100 / Object.keys(x.goalValues).length  +80

        for (const value of Object.values(x.goalValues)) {
          out.push([{svg: barvisjs.createSVG(width, value, "teal").outerHTML},
          (value * 100).toFixed(0) + '%'])
        }

        predictions.push(out)
      })


      data.content.push(this.pdfTable(predictions))
    },

    /**
     * adds explanation info to pdf
     *
     * @param data
     */
    pdf_add_explanations(data) {
      data.content.push({text: this.$t("Explanation"), style: 'subheader'})

      if (this.Store.predictions.selectedOption) {
        let currentOption = ""
        for (const [node, option] of Object.entries(this.Store.predictions.selectedOption.option)) {
          currentOption += this.Store.labels.nodes[node] + ": " + this.Store.labels.states[node][option] + "\n"
        }

        if (currentOption !== "") {
          data.content.push({text: currentOption})
        }
      }

      let explanationsHeader = ["", this.$t("Relevance")]

      for (const goal of this.PatientStore.goals) {
        explanationsHeader.push(this.Store.labels.nodes[goal.name] + ": " +
            this.Store.labels.states[goal.name][goal.selected.name] + " (" +
            this.$t(goal.direction) + ")")
      }

      let explanations = [explanationsHeader]

      this.Store.explain.relevance.map(x => {
        const width = 100 / Object.keys(x.relevancies).length  +50

        let out = [
          this.Store.labels.nodes[x.node_name] + ": " + this.getState(x.node_name),
          {svg: barvisjs.createSVG(width, x.overall_relevance, "#004d80").outerHTML}
        ]


        for (const value of Object.values(x.relevancies)) {
          out.push({svg: twosidedbarvisjs.createSVG(width, value).outerHTML})
        }

        explanations.push(out)
      })

      data.content.push(this.pdfTable(explanations))
    },

    /**
     * returns state of a node
     *
     * @param name
     * @returns {string}
     */
    getState(name) {
      let state = "unknown"
      this.Store.explain.states.forEach(node => {
        if (node.name === name) {
          state = this.Store.labels.states[name][node.state]
        }
      })
      return state
    }
  }
})
</script>

<style scoped>

</style>