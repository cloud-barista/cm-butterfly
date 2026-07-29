import { RouteConfig } from 'vue-router';
// import { CLOUD_RESOURCES_ROUTE } from '@/app/providers/router/routes/constants';
// import { cloudCredentialsPage, apisPage } from '@/pages/cloudResources';

/*
  Cloud Resources is withheld until credential management can be offered safely.
  The reasoning is in api/conf/menu.yaml, which drops the same entries from the
  menu tree the server hands out.

  The routes go too, not just the menu. Hiding a menu still leaves the address
  reachable by typing it, and these screens can write state that cannot be
  undone from the console.

  The pages and widgets are left in place - only the wiring is cut. Restoring
  means putting back this file, the menu tree and the reachable list together.
*/
export const cloudResourcesRoutes: RouteConfig[] = [
  // {
  //   path: 'cloud-resources',
  //   name: CLOUD_RESOURCES_ROUTE._NAME,
  //   component: { template: '<router-view/>' },
  //   children: [
  //     {
  //       path: 'cloud-credentials',
  //       name: CLOUD_RESOURCES_ROUTE.CLOUD_CREDENTIALS._NAME,
  //       component: cloudCredentialsPage,
  //       meta: {
  //         menuId: CLOUD_RESOURCES_ROUTE.CLOUD_CREDENTIALS._NAME,
  //         category: CLOUD_RESOURCES_ROUTE._NAME,
  //       },
  //     },
  //     {
  //       path: 'apis',
  //       name: CLOUD_RESOURCES_ROUTE.APIS._NAME,
  //       component: apisPage,
  //       meta: {
  //         menuId: CLOUD_RESOURCES_ROUTE.APIS._NAME,
  //         category: CLOUD_RESOURCES_ROUTE._NAME,
  //       },
  //     },
  //   ],
  // },
];
