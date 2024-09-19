import { RouteConfig } from 'vue-router';
import { AddSourceConnectionPage } from '@/pages/temp';

export const tempRoutes: RouteConfig[] = [
  {
    path: 'source-connection',
    name: 'sourceConnection',
    component: AddSourceConnectionPage,
    meta: {},
  },
];
