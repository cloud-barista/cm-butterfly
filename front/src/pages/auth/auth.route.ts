//기본라우터는 dashboard이고 하위폴더에 속한 폴더 경로를 여기서 정의
import { RouteConfig } from 'vue-router';
import LoginPage from '@/pages/auth/login/ui/LoginPage.vue';
import SignupPage from '@/pages/auth/signup/SignupPage.vue';
import CookiePage from '@/pages/auth/cookie/CookiePage.vue';

export const AUTH_ROUTE = {
  _NAME: 'auth',
  LOGIN: {
    _NAME: 'login',
  },
  SIGNUP: {
    _NAME: 'signup',
  },
  COOKIE: {
    _NAME: 'cookie',
  },
};

const authRoutes: RouteConfig[] = [
  {
    path: '/auth',
    component: { template: '<router-view class="w-full h-full" />' },
    children: [
      {
        path: 'login',
        name: AUTH_ROUTE.LOGIN._NAME,
        component: LoginPage,
      },
      {
        path: 'signup',
        name: AUTH_ROUTE.SIGNUP._NAME,
        component: SignupPage,
      },
      {
        path: 'cookie',
        name: AUTH_ROUTE.COOKIE._NAME,
        component: CookiePage,
      },
    ],
  },
];

export default authRoutes;
