import { createApp} from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import Dialog from 'primevue/dialog';
import MegaMenu from 'primevue/megamenu'
import Panel from 'primevue/panel';
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
      .mount('#app')

