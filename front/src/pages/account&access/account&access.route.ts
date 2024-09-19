//기본라우터는 dashboard이고 하위폴더에 속한 폴더 경로를 여기서 정의
import { RouteConfig } from 'vue-router';
import { UserPage } from './users';

export const ACCOINTANDACCESS_ROUTE = {
  _NAME: 'ACCOINTANDACCESS_ROUTE',
  USER: {
    _NAME: 'ACCOINTANDACCESS_USER',
  },
} as const;

const accountAndAccessRoute: RouteConfig[] = [
  {
    path: 'accountandaccess',
    name: ACCOINTANDACCESS_ROUTE._NAME,
    component: { template: '<router-view class="w-full h-full" />' },
    meta: {
      roles: [],
    },
    children: [
      {
        path: 'users',
        name: ACCOINTANDACCESS_ROUTE.USER._NAME,
        component: UserPage,
      },
    ],
  },
];

export default accountAndAccessRoute;
