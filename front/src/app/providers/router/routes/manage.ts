import { RouteConfig } from 'vue-router';
import workloadsRoutes from './workloads';

export const MANAGE_ROUTE = {
  _NAME: 'Manage',
};

export const manageRoutes: RouteConfig[] = [
  {
    path: 'manage',
    name: MANAGE_ROUTE._NAME,
    component: { template: '<router-view/>' },
    meta: {
      roles: [],
    },
    children: [...workloadsRoutes],
  },
];
