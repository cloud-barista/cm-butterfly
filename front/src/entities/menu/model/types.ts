import { TranslateResult } from 'vue-i18n';

export const MENU_ID = Object.freeze({
  // C-MIGRATOR
  SOURCE_COMPUTING: 'sourceComputing',
  SOURCE_SERVICES: 'sourceServices',
  SOURCE_CONNECTIONS: 'sourceConnections',
  MODELS: 'models',
  SOURCE_MODELS: 'sourceModels',
  TARGET_MODELS: 'targetModels',
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
  menu: IMenu[];
  submenus?: any[];
}
