import { RouteConfig } from 'vue-router';
import { MODEL_ROUTE } from '@/app/providers/router/routes/constants';
import { SourceModelsPage } from '@/pages/models';
import { TargetModelsPage } from '@/pages/models';

export const modelRoutes: RouteConfig[] = [
  {
    path: 'models',
    name: MODEL_ROUTE._NAME,
    component: { template: '<router-view/>' },
    children: [
      {
        path: 'source-models',
        name: MODEL_ROUTE.SOURCE_MODELS._NAME,
        component: SourceModelsPage,
        meta: {
          menuId: MODEL_ROUTE.SOURCE_MODELS._NAME,
          category: MODEL_ROUTE._NAME,
        },
      },
      {
        path: 'target-models',
        name: MODEL_ROUTE.TARGET_MODELS._NAME,
        component: TargetModelsPage,
        meta: {
          menuId: MODEL_ROUTE.TARGET_MODELS._NAME,
          category: MODEL_ROUTE._NAME,
        },
      },
    ],
  },
];
