import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

export default new VueRouter({
  routes: [
    {
      path: '/',
      name: 'main',
      // component: () => import(/* webpackChunkName: "main" */ './views/dTypeBrowse.vue'),
      redirect: '/dtype/0/dType',
    },
    {
      path: '/dtype/:hash',
      name: 'dtypeHash',
      component: () => import(/* webpackChunkName: "dtype" */ './views/dTypeLandingPage.vue'),
      props: route => ({hash: route.params.hash}),
    },
    {
      path: '/dtype/:lang/:name',
      name: 'dtypeName',
      component: () => import(/* webpackChunkName: "dtype" */ './views/dTypeLandingPage.vue'),
      props: route => ({lang: route.params.lang, name: route.params.name}),
    },
    {
      path: '/alias',
      name: 'alias',
      component: () => import(/* webpackChunkName: "alias" */ './views/Alias.vue'),
      props: route => ({query: route.query}),
    },
  ],
});
