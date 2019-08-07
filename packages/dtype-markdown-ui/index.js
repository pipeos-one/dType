import MarkdownRenderer from './src/components/MarkdownRenderer.vue';

export {MarkdownRenderer};

const componentMap = {
  view: MarkdownRenderer,
  edit: MarkdownRenderer,
};

export const getComponent = (type) => {
  return componentMap[type] || MarkdownRenderer;
};
