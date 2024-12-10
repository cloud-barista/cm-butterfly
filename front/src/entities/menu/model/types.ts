import { TranslateResult } from 'vue-i18n';

export const MENU_ID = Object.freeze({
  // C-MIGRATOR
  MIGRATIONS: 'migrations',
  MIGRATION_GUIDE: 'migrationguide',
  SOURCE_COMPUTING: 'sourcecomputing',
  SOURCE_SERVICES: 'sourceservices',
  SOURCE_CONNECTIONS: 'sourceconnections',
  MODELS: 'models',
  SOURCE_MODELS: 'sourcemodels',
  TARGET_MODELS: 'targetmodels',
  WORKFLOW_MANAGEMENT: 'workflowmanagement',
  WORKFLOWS: 'workflows',
  WORKFLOW_TEMPLATES: 'workflowtemplates',
  TASK_COMPONENTS: 'taskcomponents',
  WORKLOAD_OPERATIONS: 'workloadoperations',
  WORKLOADS: 'workloads',
  MCI_WLS: 'mciwls',
  PMK_WLS: 'pmkwls',
  CLOUD_RESOURCES: 'cloudresources',
  CLOUD_CONNECTIONS: 'cloudconnections',
});

export interface ICategory {
  id: string;
  name: TranslateResult;
}
export interface IMenu extends ICategory {
  submenus: any[] | null;
}
export interface MigratorMenu {
  category: ICategory;
  menu: IMenu[] | null | any;
}

export interface IMigratorMenu {
  displayname: string;
  id: string;
  isaction: string;
  menus: IMigratorMenu[] | null;
  parentid: string | null;
  priority: number;
  restype: 'menu';
}
