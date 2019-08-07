import DefaultView from './src/components/DefaultView.vue';
import DefaultEdit from './src/components/DefaultEdit.vue';

export {DefaultView, DefaultEdit};

const componentMap = {
  view: DefaultView,
  edit: DefaultEdit,
};

export const getComponent = (type) => {
  return componentMap[type] || DefaultView;
};
