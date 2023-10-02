<template>
  <DataTable :value="data" responsiveLayout="scroll" :autoLayout="false" sortField="label" :sortOrder="1"
             class="p-datatable-sm w-full" :scrollable="true" scrollHeight="flex" id="name"
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
            <div @click="toggle(slotProps.data)" class="w-full cursor-pointer">{{slotProps.data.label}}</div>
        </template>
    </Column>
    <Column :header="$t('Prediction')" field="state" :sortable="true">
      <template #body="slotProps">
        <div :style="{color:color(slotProps.data.probability)}" @click="toggle(slotProps.data)" class="w-full cursor-pointer"
             v-tooltip.bottom="capitalize((slotProps.data.probability !== 1)? $t('Prediction') : $t('given')) + ': ' + slotProps.data.state">
            {{ slotProps.data.state }}</div>
      </template>
    </Column>
    <Column :header="$t('Likeliness')" field="probability" :sortable="true">
      <template #body="slotProps">
        <bar v-if="slotProps.data.probability !== 1" :value="slotProps.data.probability" color="slategray"
             :width="150" @click="toggle(slotProps.data)" class="w-full cursor-pointer"
             v-tooltip.bottom="$t('Likeliness') + ': ' +(slotProps.data.probability*100).toFixed(0) +'%'"/>
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

<script>
import {useStore} from '@/store'
import {FilterMatchMode} from 'primevue/api';
import bar from "@/components/visualisations/bar-vis.vue";

export default {
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
          value: '',
          matchMode: FilterMatchMode.CONTAINS
        }
      },
      expandedRows: []
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
        let data = []
        this.Store.explain.states.forEach(a => {
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
        let data = []
        this.Store.explain.states.forEach(a => {
          let compareNode = this.Store.compareConfig.explain.states.find(n => n.name === a.name)
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
    color(probability) {
      if (probability === 1) return "black"
      return "mediumblue"
    },
      /**
       * toggles the expansion of a row
       *
       * @param row
       */
    toggle(row) {
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
      capitalize(string) {
          return string.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    },
  }
}
</script>

<style scoped>
</style>