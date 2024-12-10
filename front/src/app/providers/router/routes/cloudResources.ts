import { RouteConfig } from 'vue-router';
import { CLOUD_RESOURCES_ROUTE } from './constants';
import { cloudConnectionPage } from '@/pages/cloudResources';

export const cloudResourcesRoutes: RouteConfig[] = [
  {
    path: 'cloud-resources',
    name: CLOUD_RESOURCES_ROUTE._NAME,
    component: { template: '<router-view/>' },
    children: [
      {
        path: 'cloud-connections',
        name: CLOUD_RESOURCES_ROUTE.CLOUD_CONNECTIONS._NAME,
        component: cloudConnectionPage,
        meta: {
          menuId: CLOUD_RESOURCES_ROUTE.CLOUD_CONNECTIONS._NAME,
          category: CLOUD_RESOURCES_ROUTE._NAME,
        },
      },
    ],
  },
];
