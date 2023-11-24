import { createApp} from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config';
import Dialog from 'primevue/dialog';
import Menubar from 'primevue/menubar'
import Menu from 'primevue/menu';
import Panel from 'primevue/panel';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import PanelMenu from 'primevue/panelmenu';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Listbox from 'primevue/listbox';
import OverlayPanel from 'primevue/overlaypanel';
import CascadeSelect from 'primevue/cascadeselect';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColumnGroup from "primevue/columngroup";
import Row from "primevue/row";
import Dropdown from 'primevue/dropdown';
import Divider from 'primevue/divider';
import ScrollPanel from "primevue/scrollpanel";
import Checkbox from "primevue/checkbox";
import Textarea from 'primevue/textarea';
import InputText from 'primevue/inputtext';
import Tooltip from 'primevue/tooltip';
import Card from 'primevue/card';
import Chip from 'primevue/chip';
import FileUpload from 'primevue/fileupload';
import ProgressBar from 'primevue/progressbar';
import BlockUI from 'primevue/blockui';
import ToggleButton from 'primevue/togglebutton';
import SelectButton from 'primevue/selectbutton';
import Toolbar from 'primevue/toolbar';
import ProgressSpinner from 'primevue/progressspinner';
import 'primevue/resources/themes/tailwind-light/theme.css';       //theme
import 'primevue/resources/primevue.min.css'                 //core css
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css';

import { createPinia } from 'pinia'
import Button from 'primevue/button';

import { createI18n } from 'vue-i18n'


import en from './languages/en.json'
import de from './languages/de.json'
import nl from './languages/nl.json'

const i18n = createI18n({
  locale: 'en',
  messages: {
    en,
    de,
    nl
  }
})
let vueApp = createApp(App)


vueApp.use(PrimeVue)
    .component('Dialog', Dialog)
    .component('Button', Button)
    .component('Menubar', Menubar)
    .component('Panel', Panel)
    .component('TabView', TabView)
    .component('TabPanel', TabPanel)
    .component('PanelMenu', PanelMenu)
    .component('Accordion', Accordion)
    .component('AccordionTab', AccordionTab)
    .component('Listbox', Listbox)
    .component('OverlayPanel', OverlayPanel)
    .component('CascadeSelect', CascadeSelect)
    .component('DataTable', DataTable)
    .component('Column', Column)
    .component('ColumnGroup', ColumnGroup)
    .component('Row', Row)
    .component('Dropdown', Dropdown)
    .component('Divider', Divider)
    .component('Menu', Menu)
    .component('ScrollPanel', ScrollPanel)
    .component('Checkbox', Checkbox)
    .component('Textarea', Textarea)
    .component('InputText', InputText)
    .component('Card', Card)
    .component('Chip', Chip)
    .component('FileUpload', FileUpload)
    .component('ProgressBar', ProgressBar)
    .component('BlockUI', BlockUI)
    .component('ToggleButton',ToggleButton)
    .component('SelectButton', SelectButton)
    .component('Toolbar', Toolbar)
    .component('ProgressSpinner', ProgressSpinner)
    .component('ToggleButton', ToggleButton)
    .directive('tooltip', Tooltip)

vueApp.use(createPinia())
vueApp.use(i18n)
vueApp.use(router)
vueApp.mount('#app')

