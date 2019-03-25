import Vue from 'vue';
import './plugins/vuetify';
import App from './App.vue';
import dTypeStore from './vuex.js';

import router from './router';

Vue.config.productionTip = false;

new Vue({
    router,
    store: dTypeStore,
    render: h => h(App),
}).$mount('#app');
