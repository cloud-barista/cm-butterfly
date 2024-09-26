import { RouteConfig } from 'vue-router';
import { AddSourceConnectionPage } from '@/pages/sourceConnections';
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
          menuId: SOURCE_COMPUTING_ROUTE._NAME,
        },
      },
      {
        path: 'source-connection',
        name: SOURCE_COMPUTING_ROUTE.SOURCE_SERVICES.SOURCE_CONNECTION._NAME,
        component: AddSourceConnectionPage,
        meta: {
          menuId: SOURCE_COMPUTING_ROUTE._NAME,
        },
      },
    ],
  },
  // {
  //   path: 'source-connection',
  //   name: 'sourceConnection',
  //   // TODO: Update Source Services Page
  //   component: AddSourceConnectionPage,
  //   meta: {},
  // },
  // {
  //   path: 'source-connection/viewer',
  //   name: 'sourceConnectionViewer',
  //   component: SourceConnectionViewerPage,
  //   meta: {},
  // },
];
