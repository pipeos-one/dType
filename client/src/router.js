import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

export default new VueRouter({
    routes: [
        {
            path: '/',
            name: 'browse',
            component: () => import(/* webpackChunkName: "about" */ './views/dTypeBrowse.vue'),
        },
        {
            path: '/dtype/:hash',
            name: 'dtype',
            component: () => import(/* webpackChunkName: "about" */ './views/dTypeInfo.vue'),
            props: route => ({hash: route.params.hash}),
        },
        {
            path: '/dtype/:lang/:name',
            name: 'dtype',
            component: () => import(/* webpackChunkName: "about" */ './views/dTypeInfo.vue'),
            props: route => ({lang: route.params.lang, name: route.params.name}),
        },
    ],
});
