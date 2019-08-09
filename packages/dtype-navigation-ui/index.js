import aliasStore from './src/store.js';
import AliasSelector from './src/components/AliasSelector.vue';
import Alias from './src/components/Alias.vue';
import {install} from './src/globals.js';


// Auto-install (Window/Node)
let GlobalVue
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue
}
if (GlobalVue) {
  GlobalVue.use(Install)
}

export {aliasStore, AliasSelector, Alias, install};
