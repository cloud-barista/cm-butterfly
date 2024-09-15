export const MENU_ID = Object.freeze({
  // MCMP
  ORGANIZATIONS: 'organizations',
  USERS: 'users',
  VPC: 'vpc',
  MANAGE_WORKLOADS: 'workloads',
  MANAGE_WORKSPACE: 'workspaces',

  // C-MIGRATOR
  SOURCE_SERVICES: 'sourceServices',
  SOURCE_MODELS: 'sourceModels',
  TARGET_MODELS: 'targetModels',
  WORKFLOWS: 'workflows',
  WORKFLOW_TEMPLATES: 'workflowTemplates',
  TASK_COMPONENTS: 'taskComponents',
});

export type MenuId = (typeof MENU_ID)[keyof typeof MENU_ID];

export interface Menu {
  id: MenuId;
  needPermissionByRole?: boolean;
  subMenuList?: Menu[];
  hideOnGNB?: boolean;
  hideOnSiteMap?: boolean;
}
export interface MenuInfo {
  menuId: MenuId;
  routeName: string;
  translationId: string;
  icon?: string;
  // highlightTag?: HighlightTagType;
}

// export const MENU_ID_TO_NAME = Object.freeze({
//   [MENU_ID.SETTING]: 'Settings',
//   [MENU_ID.ACCOUNT_AND_ACCESS]: 'Account & Access',
//   [MENU_ID.ACCOUNT_AND_ACCESS_ORGANIZATIONS]: 'Organizations',
//   [MENU_ID.ORGANIZATIONS_USERS]: 'Users',
//   [MENU_ID.ORGANIZATIONS_APPROVALS]: 'Approvals',
//   [MENU_ID.ORGANIZATIONS_ACCESS_CONTROLS]: 'Access Controls',

//   [MENU_ID.ENVIRONMENT]: 'Environment',
//   [MENU_ID.ENVIRONMENT_CLOUD_RESOURCES]: 'Cloud Resources',

//   [MENU_ID.OPERATION]: 'Operations',
//   [MENU_ID.MANAGE]: 'Manage',
//   [MENU_ID.MANAGE_WORKLOADS]: 'Workloads',
//   [MENU_ID.WORKLOADS_MCI]: 'MCI',
//   [MENU_ID.WORKLOADS_PMK]: 'PMK',

//   [MENU_ID.MANAGE_WORKSPACE]: 'Workspaces',
// });
