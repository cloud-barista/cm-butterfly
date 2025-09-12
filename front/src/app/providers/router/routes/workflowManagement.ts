import { RouteConfig } from 'vue-router';
import { WORKFLOW_MANAGEMENT_ROUTE } from '@/app/providers/router/routes/constants';
import {
  WorkflowsPage,
  WorkflowTemplatesPage,
  TaskComponentsPage,
} from '@/pages/workflowManagement';

export const workflowManagementRoutes: RouteConfig[] = [
  {
    path: 'workflow-management',
    name: WORKFLOW_MANAGEMENT_ROUTE._NAME,
    component: { template: '<router-view/>' },
    children: [
      {
        path: 'workflows',
        name: WORKFLOW_MANAGEMENT_ROUTE.WORKFLOWS._NAME,
        component: WorkflowsPage,
        meta: {
          menuId: WORKFLOW_MANAGEMENT_ROUTE.WORKFLOWS._NAME,
          category: WORKFLOW_MANAGEMENT_ROUTE._NAME,
        },
      },
      {
        path: 'workflow-templates',
        name: WORKFLOW_MANAGEMENT_ROUTE.WORKFLOW_TEMPLATES._NAME,
        component: WorkflowTemplatesPage,
        meta: {
          menuId: WORKFLOW_MANAGEMENT_ROUTE.WORKFLOW_TEMPLATES._NAME,
          category: WORKFLOW_MANAGEMENT_ROUTE._NAME,
        },
      },
      {
        path: 'task-components',
        name: WORKFLOW_MANAGEMENT_ROUTE.TASK_COMPONENTS._NAME,
        component: TaskComponentsPage,
        meta: {
          menuId: WORKFLOW_MANAGEMENT_ROUTE.TASK_COMPONENTS._NAME,
          category: WORKFLOW_MANAGEMENT_ROUTE._NAME,
        },
      },
    ],
  },
];
