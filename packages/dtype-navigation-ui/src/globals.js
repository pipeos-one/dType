import AliasSelector from './components/AliasSelector';
import Alias from './components/Alias';

export const install = (Vue) => {
  Vue.component(AliasSelector.name, AliasSelector);
  Vue.component(Alias.name, Alias);
};
