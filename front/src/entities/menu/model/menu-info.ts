// menu routeinfo
import type { MenuId, MenuInfo } from '../../index';
import { MENU_ID } from '../../index';

import { ORGANIZATIONS_ROUTE } from '../../../app/providers/router/routes/organizations';
import { CLOUD_RESOURCES_ROUTE } from '../../../app/providers/router/routes/cloudResources';

export const MENU_INFO_MAP: Record<MenuId, MenuInfo> = Object.freeze({
  [MENU_ID.ORGANIZATIONS]: {
    menuId: MENU_ID.ORGANIZATIONS,
    routeName: ORGANIZATIONS_ROUTE._NAME,
    translationId: 'MENU.SETTINGS.ACCOUNT_ACCESS.ORGANIZATIONS._NAME',
    icon: 'ic_service_user',
  },
  [MENU_ID.USERS]: {
    menuId: MENU_ID.USERS,
    routeName: ORGANIZATIONS_ROUTE.USERS._NAME,
    translationId: 'MENU.SETTINGS.ACCOUNT_ACCESS.ORGANIZATIONS.USERS',
    icon: 'ic_service_user',
  },
  [MENU_ID.VPC]: {
    menuId: MENU_ID.VPC,
    routeName: CLOUD_RESOURCES_ROUTE.VPC._NAME,
    translationId: 'VPC',
    icon: 'ic_service_cloud-service',
  },
  [MENU_ID.MANAGE_WORKLOADS]: {
    menuId: MENU_ID.MANAGE_WORKLOADS,
    routeName: 'Workloads',
    translationId: 'MENU.OPERATIONS.MANAGE.WORKLOADS._NAME',
    icon: 'ic_service_workload',
  },
  [MENU_ID.MANAGE_WORKSPACE]: {
    menuId: MENU_ID.MANAGE_WORKSPACE,
    routeName: 'Workspaces',
    translationId: 'WORKSPACE._NAME',
    icon: 'ic_service_workspace',
  },
  [MENU_ID.SOURCE_SERVICES]: {
    menuId: MENU_ID.SOURCE_SERVICES,
    routeName: 'SourceServices',
    translationId: 'Source Services',
    icon: 'ic_service_source-service',
  },
  [MENU_ID.SOURCE_MODELS]: {
    menuId: MENU_ID.SOURCE_MODELS,
    routeName: 'SourceModels',
    translationId: 'Source Models',
    icon: 'ic_service_source-model',
  },
  [MENU_ID.TARGET_MODELS]: {
    menuId: MENU_ID.TARGET_MODELS,
    routeName: 'TargetModels',
    translationId: 'Target Models',
    icon: 'ic_service_target-model',
  },
  [MENU_ID.WORKFLOWS]: {
    menuId: MENU_ID.WORKFLOWS,
    routeName: 'Workflows',
    translationId: 'Workflows',
    icon: 'ic_service_workflow',
  },
  [MENU_ID.WORKFLOW_TEMPLATES]: {
    menuId: MENU_ID.WORKFLOW_TEMPLATES,
    routeName: 'WorkflowTemplates',
    translationId: 'Workflow Templates',
    icon: 'ic_service_workflow-template',
  },
  [MENU_ID.TASK_COMPONENTS]: {
    menuId: MENU_ID.TASK_COMPONENTS,
    routeName: 'TaskComponents',
    translationId: 'Task Components',
    icon: 'ic_service_task-component',
  },
});
