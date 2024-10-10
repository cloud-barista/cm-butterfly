import VueRouter, { RouteConfig } from 'vue-router';
import { ROOT_ROUTE } from './routes/constants';
import authRoutes from '../../../pages/auth/auth.route.ts';
import { sourceComputingRoutes } from './routes/sourceComputing.ts';
import { MainLayout } from '../../Layouts';
import WorkflowTemplate from '@/features/workflow/workflowDesigner/ui/WorkflowDesigner.vue';
import NotFound from '@/pages/error/404/NotFound.vue';
//TODO admin부분 고려

const accessiblePagesWithRoles = [] as any[];

export class McmpRouter {
  static router: VueRouter | null = null;

  private static rootRoute: RouteConfig[] = [
    {
      path: '/',
      redirect: '/main',
      name: ROOT_ROUTE._NAME,
    },
    {
      path: '/main',
      component: MainLayout,
      children: [...sourceComputingRoutes],
    },
    ...authRoutes,
    {
      path: '/test',
      component: WorkflowTemplate,
    },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
  ];

  public static getRouter(): VueRouter {
    if (McmpRouter.router === null) {
      McmpRouter.initRouter();
    }
    return McmpRouter.router!;
  }

  public static initRouter() {
    if (this.router === null) {
      McmpRouter.router = new VueRouter({
        mode: 'history',
        routes: McmpRouter.rootRoute,
      });
      // McmpRouter.router.beforeEach((to: Route, from: Route, next) => {
      //   const requiresAuth = to.matched.some(
      //     record => record.meta?.requiresAuth,
      //   );
      //   // const isAuthenticated = useAuthenticationStore().login;
      //   const isAuthenticated = true; // temporary value

      //   // TODO: 인증된 유저의 role 목록. (우선 static data)
      //   const userRoles: RoleType[] = Object.values(ROLE_TYPE); // temporary value
      //   console.log(userRoles);

      //   // userRoles.forEach((userRole: RoleType) => {
      //   //   const isAccessible = getMinimalPageAccessPermissionList(
      //   //     userRole,
      //   //   ).includes(toLower(String(to.name)) as MenuId);

      //   //   if (requiresAuth) {
      //   //     if (!isAuthenticated) {
      //   //       next({ name: AUTH_ROUTE.LOGIN._NAME });
      //   //       return;
      //   //       // 2-2. 접근 불가능한 role인 경우 next(false)로 막기 - option: forbidden page로 이동
      //   //     } else if (isAuthenticated && isAccessible) {
      //   //       next();
      //   //     } else if (isAuthenticated && !isAccessible) {
      //   //       alert('권한이 없습니다.');
      //   //       next(false);
      //   //     } else {
      //   //       next();
      //   //     }
      //   //   } else {
      //   //     next();
      //   //   }

      //   // 1. 인증되지 않은 사용자가 접근하려 할 때 ()
      //   // if (requiresAuth && !isAuthenticated) {
      //   //   next({ name: AUTH_ROUTE.LOGIN._NAME });
      //   //   return;
      //   //   // 2-2. 접근 불가능한 role인 경우 next(false)로 막기 - option: forbidden page로 이동
      //   // } else if (requiresAuth && !to.meta?.role.includes(userRole)) {
      //   //   next(false);
      //   //   alert('권한이 없습니다.');
      //   // } else {
      //   //   next();
      //   // }
      // });

      // getMinimalPageAccessPermissionList(userRole).forEach(
      //   (menuId: MenuId) => {
      //     if (toLower(String(to.name)) === toLower(menuId)) {
      //       next({ name: to.name as string });
      //     } else if (toLower(String(to.name)) !== toLower(menuId)) {
      //       // console.log('here');
      //       // alert('권한이 없습니다.');
      //       // next();
      //     }
      //   },
      // );

      // 2. 인증된 사용자가 접근하려 할 때 (authorized)
      // 2-1. 접근 가능한 role인경우 next()
      // });

      // McmpRouter.router.beforeEach((to: Route, from: Route, next) => {
      //   const isLogin = useAuthenticationStore().login;
      //   // const userRole = useAuthorizationStore().role;

      //   console.log(isLogin);
      //   // console.log(userRole);
      //   // console.log(to);

      //   if (!isLogin) {
      //     if (to.name === AUTH_ROUTE.LOGIN._NAME) {
      //       next();
      //       return;
      //     } else {
      //       next({ name: AUTH_ROUTE.LOGIN._NAME });
      //     }
      //   }

      //   /* 역할기반 access control */
      //   const accessibleRoles: AuthorizationType[] = to.meta?.roles || [];

      //   /*
      //    * 1. admin 만 접근가능한 페이지 인지를 판단함.
      //    * 2. admin만 접근 가능하다면 role이 admin인지 판단함.
      //    * 3-1. role이 admin이 아니라면 from으로 돌아가고 alert를 함.
      //    * 3-2. role이 admin이라면 to로 next함.
      //    *
      //    *
      //    * 유저별로 접근가능한 메뉴가 다르다면?
      //    * 1. 서버에서 접근가능한 메뉴목록들을 가져와서 변수에 저장한다음, 페이지를 이동할 때 마다 해당 변수에 값이 들어있는지를 검사하는 로직을 추가.
      //    * */

      //   // if (accessibleRoles.length > 0 && accessibleRoles.includes('admin')) {
      //   //   if (userRole === 'admin') {
      //   //     next();
      //   //   } else {
      //   //     next(false);
      //   //     alert('권한이 없습니다.');
      //   //   }
      //   // } else {
      //   //   next();
      //   // }
      // });
    }
  }
}
