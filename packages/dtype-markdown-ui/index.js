import MarkdownEdit from './src/components/MarkdownEdit.vue';
import MarkdownView from './src/components/MarkdownView.vue';

export {MarkdownEdit, MarkdownView};

const componentMap = {
  view: MarkdownView,
  edit: MarkdownEdit,
};

export const getComponent = (type) => {
  return componentMap[type] || MarkdownView;
};
