import { RouteConfig } from 'vue-router';
import { CLOUD_RESOURCES_ROUTE } from './constants';
import { cloudCredentialsPage } from '@/pages/cloudResources';

export const cloudResourcesRoutes: RouteConfig[] = [
  {
    path: 'cloud-resources',
    name: CLOUD_RESOURCES_ROUTE._NAME,
    component: { template: '<router-view/>' },
    children: [
      {
        path: 'cloud-credentials',
        name: CLOUD_RESOURCES_ROUTE.CLOUD_CREDENTIALS._NAME,
        component: cloudCredentialsPage,
        meta: {
          menuId: CLOUD_RESOURCES_ROUTE.CLOUD_CREDENTIALS._NAME,
          category: CLOUD_RESOURCES_ROUTE._NAME,
        },
      },
    ],
  },
];
