import { RouteConfig } from 'vue-router';
import { SOURCE_COMPUTING_ROUTE } from './constants';
import SourceServicePage from '@/pages/sourceServices/ui/SourceServicePage.vue';

export const sourceComputingRoutes: RouteConfig[] = [
  {
    path: 'source-computing',
    name: SOURCE_COMPUTING_ROUTE._NAME,
    component: { template: '<router-view/>' },
    children: [
      {
        path: 'source-services',
        name: SOURCE_COMPUTING_ROUTE.SOURCE_SERVICES._NAME,
        component: SourceServicePage,
        meta: {
          menuId: SOURCE_COMPUTING_ROUTE.SOURCE_SERVICES._NAME,
          category: SOURCE_COMPUTING_ROUTE._NAME,
        },
      },
    ],
  },
];
