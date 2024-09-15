import { RouteConfig } from 'vue-router';
import { MENU_ID } from '../../../../entities';
import { WorkloadsPage } from '../../../../pages/workloads';
import { MCIPage } from '../../../../pages/mci';
import { i18n } from '../../../i18n';

const category = i18n.t('MENU.OPERATIONS.MANAGE._NAME');

export const WORKLOADS_ROUTE = {
  _NAME: 'Workloads',
  MCI: {
    _NAME: 'mci',
  },
  PMK: {
    _NAME: 'pmk',
  },
};

const workloadsRoutes: RouteConfig[] = [
  {
    path: 'workloads',
    name: WORKLOADS_ROUTE._NAME,
    component: WorkloadsPage,
    meta: {
      requiresAuth: true,
      lsbVisible: true,
      menuId: MENU_ID.MANAGE_WORKLOADS,
      category,
    },
    children: [
      {
        path: 'mci',
        name: WORKLOADS_ROUTE.MCI._NAME,
        component: MCIPage,
        meta: {
          requiresAuth: true,
          lsbVisible: true,
          menuId: MENU_ID.MANAGE_WORKLOADS,
          category,
        },
      },
    ],
  },
];

export default workloadsRoutes;
