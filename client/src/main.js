import Vue from 'vue';
import Vuex from 'vuex';
import {aliasStore, install} from '@dtype/navigation-ui';
import './plugins/vuetify';
import App from './App.vue';
import dTypeStore from './vuex.js';

import router from './router';

Vue.use(Vuex);
Vue.config.productionTip = false;

const store = new Vuex.Store({
  modules: {
    dtype: dTypeStore,
    alias: aliasStore,
  },
});

install(Vue);

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
