import { RouteConfig } from 'vue-router';
import {
  AddSourceConnectionPage,
  EditSourceConnectionPage,
} from '@/pages/temp';
import { SourceConnectionViewerPage } from '@/pages/temp';
import { SOURCE_COMPUTING_ROUTE } from './constants';

export const sourceComputingRoutes: RouteConfig[] = [
  {
    path: 'source-computing',
    name: SOURCE_COMPUTING_ROUTE._NAME,
    component: { template: '<router-view/>' },
    children: [
      {
        path: 'source-services',
        name: SOURCE_COMPUTING_ROUTE.SOURCE_SERVICES._NAME,
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
