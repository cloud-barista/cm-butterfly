import { RouteConfig } from 'vue-router';
import { AddSourceConnectionPage } from '@/pages/temp';
import { SourceConnectionViewerPage } from '@/pages/temp';

export const tempRoutes: RouteConfig[] = [
  {
    path: 'source-connection',
    name: 'sourceConnection',
    component: AddSourceConnectionPage,
    meta: {},
  },
  {
    path: 'source-connection/viewer',
    name: 'sourceConnectionViewer',
    component: SourceConnectionViewerPage,
    meta: {},
  },
];
