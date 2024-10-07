import Vue from 'vue';
import MirinaeDesignSystem from '@cloudforet-test/mirinae';
import '@cloudforet-test/mirinae/dist/style.css';
// import '@cloudforet-test/mirinae/css/light-style.css';
import { App } from './app';
import './app/style/style.pcss';
import { createPinia, PiniaVuePlugin } from 'pinia';
import VueRouter from 'vue-router';
import { McmpRouter } from './app/providers/router';
import { i18n } from './app/i18n';

const pinia = createPinia();
Vue.use(PiniaVuePlugin);
Vue.use(MirinaeDesignSystem);
Vue.use(VueRouter);

new Vue({
  i18n,
  pinia,
  router: McmpRouter.getRouter(),
  render: h => h(App),
}).$mount('#app');
