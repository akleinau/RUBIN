<template>
  <DataTable :value="data" responsiveLayout="scroll" :autoLayout="false" sortField="label" :sortOrder="1"
             class="p-datatable-sm w-full" :scrollable="true" scrollHeight="flex" id="listExplanation"
             v-model:filters="filters" filterDisplay="menu" v-model:expandedRows="expandedRows">
    <template #header>
        <div class="flex justify-content-between">
        <span class="p-input-icon-right" style="width:100%">
            <InputText style="width:100%" v-model="filters['label'].value" :placeholder="$t('search') + '...'"/>
          <i class="pi pi-search"/>
        </span>
        </div>
    </template>
    <Column expander style="width: 5rem" />
    <Column :header="$t('Node')" field="label" :sortable="true" class="w-5" @click="toggle(slotProps.data)">
        <template #body="slotProps">
            <div @click="toggle(slotProps.data)" class="w-full cursor-pointer"
              v-tooltip.bottom="get_tooltip(slotProps.data)">{{slotProps.data.label}}</div>
        </template>
    </Column>
    <Column :header="$t('Prediction')" field="state" :sortable="true">
      <template #body="slotProps">
        <div :style="{color:color(slotProps.data.probability)}" @click="toggle(slotProps.data)" class="w-full cursor-pointer"
             v-tooltip.bottom="get_tooltip(slotProps.data)">
            {{ slotProps.data.state }}</div>
      </template>
    </Column>
    <Column :header="$t('Likeliness')" field="probability" :sortable="true">
      <template #body="slotProps">
        <div class="flex justify-content-start" v-if="slotProps.data.probability !== 1">
          <bar :value="slotProps.data.probability" color="slategray"
               :width="150" @click="toggle(slotProps.data)" class="cursor-pointer"
               v-tooltip.bottom="get_tooltip(slotProps.data)"/>
          <span class="ml-2 text-gray-600">{{ (slotProps.data.probability * 100).toFixed(0) }}% </span>
        </div>
      </template>
    </Column>
    <Column header="" field="beforeState" v-if="Store.compareConfig">
      <template #body="slotProps">
        <div v-if="slotProps.data.beforeState !== ''">{{ $t("compare") }}: &nbsp;</div>
        <div :style="{color: color(slotProps.data.beforeProb)}"> {{ slotProps.data.beforeState }}</div>
      </template>
    </Column>
     <template #expansion="slotProps">
         <div class="flex mb-3 justify-content-around mr-5">
             <!--current-->
             <div  v-if="slotProps.data.probability !== 1" class="ml-5">
                 <div>  <br> </div>
                 <div v-for="(p,i) in slotProps.data.distribution" v-bind:key="i" class="flex justify-content-end">
                     {{Store.labels.states[slotProps.data.name][slotProps.data.stateNames[i]]}}:
                     {{(p*100).toFixed(0)}}%
                     <bar class="ml-2"  :value="p" color="darkblue"
                     :width="150"/>
                </div>
            </div>

            <!--compare-->
            <div  v-if="Store.compareConfig && slotProps.data.compare_probability !== 1" class="ml-5 mr-5" style="color:#6d00bf">
                 <div class="flex justify-content-center" >{{$t("compare")}}: </div>
                 <div v-for="(p,i) in slotProps.data.compare_distribution" v-bind:key="i" class="flex justify-content-end">
                     {{Store.labels.states[slotProps.data.name][slotProps.data.compare_stateNames[i]]}}:
                     {{(p*100).toFixed(0)}}%
                     <bar class="ml-2"  :value="p" color="#6d00bf"
                     :width="150"/>
                </div>
            </div>

        </div>
     </template>
  </DataTable>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {useStore} from '../../store.ts';
import {FilterMatchMode} from 'primevue/api';
import bar from '../visualisations/bar-vis.vue'
import {ExplainNode, CompareExplainNode, StateExplanation} from "../../types/explanation_types"

export default defineComponent({
  name: "list-explanation",
  components: {
    bar
  },
  setup() {
    const Store = useStore()
    return {Store}
  },
  data: function () {
    return {
      filters: {
        'label': {
          value: '' as String,
          matchMode: FilterMatchMode.CONTAINS
        }
      },
      expandedRows: [] as ExplainNode[]
    }
  },
  computed: {
      /**
       * computes data for the table
       *
       * @returns {*[]|null}
       */
    data: function () {
      if (this.Store.explain.states === null) return null
      if (this.Store.compareConfig == null) {
        let data: ExplainNode[] = []
        this.Store.explain.states.forEach((a: any) => {
          data.push({
            "name": a.name,
            "label": this.Store.labels.nodes[a.name],
            "state": this.Store.labels.states[a.name][a.state],
            "probability": a.probability,
            "beforeState": "",
            "beforeProb": 0,
            "distribution": a.distribution,
            "stateNames": a.stateNames
          })
        })
        return data
      } else {
        let data: CompareExplainNode[] = []
        let compareConfig = this.Store.compareConfig
        this.Store.explain.states.forEach((a: any) => {
          let compareNode = compareConfig.explain.states.find(n => n.name === a.name) as StateExplanation
          if (compareNode) {
            let state_label = this.Store.labels.states[a.name][a.state]
            let compare_state_label = this.Store.labels.states[a.name][compareNode.state]
            data.push({
              "name": a.name,
              "state": state_label,
              "label": this.Store.labels.nodes[a.name],
              "probability": a.probability,
              "beforeState": state_label === compare_state_label ? "" : compare_state_label,
              "beforeProb": state_label === compare_state_label ? 0 : compareNode.probability,
              "distribution": a.distribution,
              "stateNames": a.stateNames,
              "compare_probability": compareNode.probability,
              "compare_distribution": compareNode.distribution,
              "compare_stateNames": compareNode.stateNames
            })
          }
        })
        return data
      }
    }
  },
  methods: {
      /**
       * returns color used to encode the probability of the node
       *
       * @param probability
       * @returns {string}
       */
    color(probability: Number) {
      if (probability === 1) return "black"
      return "mediumblue"
    },
      /**
       * toggles the expansion of a row
       *
       * @param row
       */
    toggle(row: ExplainNode) {
          if (this.expandedRows.includes(row)) {
              this.expandedRows = this.expandedRows.filter(r => r.name !== row.name)
          } else {
              this.expandedRows.push(row)
          }
      },
      /**
       * capitalizes a string
       * @param string
       * @returns {*}
       */
      capitalize(string: String) {
          return string.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    },

    get_tooltip(data: ExplainNode) {
      let tooltip = data.label + " = " + data.state
      if (data.probability !== 1) {
        tooltip += " " + this.$t("withProbabilityOf") + " " + (data.probability * 100).toFixed(0) + "%"
      }
      return tooltip
    }

  }
})
</script>

<style scoped>
</style>