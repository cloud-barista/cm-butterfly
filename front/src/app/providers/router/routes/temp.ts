import NotFoundVue from '@/pages/error/404/NotFound.vue';
import { RouteConfig } from 'vue-router';

export const tempRoutes: RouteConfig[] = [
  {
    path: 'migration-guide',
    name: 'migrationguide',
    component: NotFoundVue,
    meta: {
      menuId: 'migrationguide',
    },
  },
  {
    path: 'source-metas',
    name: 'sourcemetas',
    component: NotFoundVue,
    meta: {
      menuId: 'sourcemetas',
    },
  },
  {
    path: 'workloads',
    name: 'workloads',
    component: NotFoundVue,
    meta: {
      menuId: 'workloads',
    },
  },
];
