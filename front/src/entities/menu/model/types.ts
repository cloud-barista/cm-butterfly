import { TranslateResult } from 'vue-i18n';

export const MENU_ID = Object.freeze({
  // C-MIGRATOR
  MIGRATIONS: 'migrations',
  SOURCE_COMPUTING: 'sourcecomputing',
  SOURCE_SERVICES: 'sourceservices',
  SOURCE_CONNECTIONS: 'sourceconnections',
  MODELS: 'models',
  SOURCE_MODELS: 'sourcemodels',
  TARGET_MODELS: 'targetmodels',
  WORKFLOWS: 'workflows',
  WORKFLOW_TEMPLATES: 'workflowTemplates',
  TASK_COMPONENTS: 'taskComponents',
});

// export type MenuId = (typeof MENU_ID)[keyof typeof MENU_ID];

export interface IMenu {
  id: string;
  name: TranslateResult;
}
export interface MigratorMenu {
  category: IMenu;
  menu: IMenu[] | null | any;
  submenus?: any[];
}

export interface IMigratorMenu {
  displayname: string;
  id: string;
  isaction: boolean;
  menus: IMigratorMenu[] | null;
  parentid: string | null;
  priority: number;
  restype: 'menu';
}
