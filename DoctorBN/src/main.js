import { createApp} from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import Dialog from 'primevue/dialog';
import MegaMenu from 'primevue/megamenu'
import Panel from 'primevue/panel';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import PanelMenu from 'primevue/panelmenu';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Listbox from 'primevue/listbox';
import OverlayPanel from 'primevue/overlaypanel';
import CascadeSelect from 'primevue/cascadeselect';
import 'primevue/resources/themes/saga-blue/theme.css'       //theme
import 'primevue/resources/primevue.min.css'                 //core css
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css';

import Button from 'primevue/button';

createApp(App)
      .use(PrimeVue)
    .component('Dialog', Dialog)
    .component('Button', Button)
    .component('MegaMenu', MegaMenu)
    .component('Panel', Panel)
    .component('TabView', TabView)
    .component('TabPanel', TabPanel)
    .component('PanelMenu', PanelMenu)
    .component('Accordion', Accordion)
    .component('AccordionTab', AccordionTab)
    .component('Listbox', Listbox)
    .component('OverlayPanel', OverlayPanel)
    .component('CascadeSelect', CascadeSelect)
      .mount('#app')

