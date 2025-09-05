import { RouteConfig } from 'vue-router';
import { WORKLOAD_OPERATIONS_ROUTE } from '@/app/providers/router/routes/constants';
import { MciPage, WorkloadsPage, PmkPage } from '@/pages/workloadOperations';

export const workloadsRoutes: RouteConfig[] = [
  {
    path: 'workload-operations',
    name: WORKLOAD_OPERATIONS_ROUTE._NAME,
    component: { template: '<router-view/>' },
    children: [
      {
        path: 'workloads',
        name: WORKLOAD_OPERATIONS_ROUTE.WORKLOADS._NAME,
        component: WorkloadsPage,
        meta: {
          lsbVisible: true,
          menuId: WORKLOAD_OPERATIONS_ROUTE.WORKLOADS._NAME,
          category: WORKLOAD_OPERATIONS_ROUTE._NAME,
        },
        children: [
          {
            path: 'mci-wls',
            name: WORKLOAD_OPERATIONS_ROUTE.WORKLOADS.MCI_WLS._NAME,
            component: MciPage,
            meta: {
              lsbVisible: true,
              menuId: WORKLOAD_OPERATIONS_ROUTE.WORKLOADS._NAME,
              category: WORKLOAD_OPERATIONS_ROUTE._NAME,
            },
          },
          {
            path: 'pmk-wls',
            name: WORKLOAD_OPERATIONS_ROUTE.WORKLOADS.PMK_WLS._NAME,
            component: PmkPage,
            meta: {
              lsbVisible: true,
              menuId: WORKLOAD_OPERATIONS_ROUTE.WORKLOADS._NAME,
              category: WORKLOAD_OPERATIONS_ROUTE._NAME,
            },
          },
        ],
      },
    ],
  },
];
