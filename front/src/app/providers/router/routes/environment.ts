import { RouteConfig } from 'vue-router';
import cloudResourcesRoutes from './cloudResources';

export const ENVIRONMENT_ROUTE = {
  _NAME: 'Environment',
};

export const environmentRoutes: RouteConfig[] = [
  {
    path: 'environment',
    name: ENVIRONMENT_ROUTE._NAME,
    component: { template: '<router-view/>' },
    meta: {
      roles: [],
    },
    children: [...cloudResourcesRoutes],
  },
];
