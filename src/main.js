import { createApp} from 'vue'
import App from './App.vue'
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
import 'primevue/resources/themes/saga-blue/theme.css';       //theme
import 'primevue/resources/primevue.min.css'                 //core css
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css';

import Button from 'primevue/button';
import { createI18n } from 'vue-i18n'
let enMessages = require('./languages/english.json');
let deMessages = require('./languages/german.json');

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'de',
  globalInjection: true,
  messages: {
    en: enMessages,
    de: deMessages
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
    .directive('tooltip', Tooltip)

vueApp.use(i18n)
vueApp.mount('#app')

