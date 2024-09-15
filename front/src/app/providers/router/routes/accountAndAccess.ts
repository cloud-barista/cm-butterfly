import { RouteConfig } from 'vue-router';
import organizationsRoutes from './organizations';

export const ACCOUNTANDACCESS_ROUTE = {
  _NAME: 'AccountAndAccess',
};

export const accountAndAccessRoutes: RouteConfig[] = [
  {
    path: 'account-and-access',
    name: ACCOUNTANDACCESS_ROUTE._NAME,
    component: { template: '<router-view/>' },
    meta: {
      roles: [],
    },
    children: [...organizationsRoutes],
  },
];
