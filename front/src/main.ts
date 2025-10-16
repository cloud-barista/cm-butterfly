import Vue from 'vue';
import MirinaeDesignSystem from '@cloudforet-test/mirinae';
import '@cloudforet-test/mirinae/dist/style.css';
import { App } from '@/app';
import { createPinia, PiniaVuePlugin } from 'pinia';
import VueRouter from 'vue-router';
import { McmpRouter } from '@/app/providers/router';
import { i18n } from '@/app/i18n';
import '@/app/style/style.pcss';
import JwtTokenProvider from '@/shared/libs/token';
import { AUTH_ROUTE } from '@/pages/auth/auth.route';

const pinia = createPinia();
Vue.use(PiniaVuePlugin);
Vue.use(MirinaeDesignSystem);
Vue.use(VueRouter);

async function init() {
  const router = McmpRouter.getRouter();

  try {
    await JwtTokenProvider.validateToken();
  } catch (e) {
    McmpRouter.getRouter()
      .push({ name: AUTH_ROUTE.LOGIN._NAME })
      .catch(() => {});
  } finally {
    new Vue({
      i18n,
      pinia,
      router: router,
      render: h => h(App),
    }).$mount('#app');
  }
}

init();
