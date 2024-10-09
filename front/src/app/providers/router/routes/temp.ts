import NotFoundVue from '@/pages/error/404/NotFound.vue';
import { SourceServicePage } from '@/pages/sourceServices';
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
    path: 'workflows',
    name: 'workflows',
    component: NotFoundVue,
    meta: {
      menuId: 'workflows',
    },
  },
  {
    path: 'workflow-templates',
    name: 'workflowtemplates',
    component: NotFoundVue,
    meta: {
      menuId: 'workflowtemplates',
    },
  },
  {
    path: 'task-components',
    name: 'taskcomponents',
    component: NotFoundVue,
    meta: {
      menuId: 'taskcomponents',
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
