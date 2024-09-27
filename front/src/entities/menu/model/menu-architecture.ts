import { i18n } from '@/app/i18n';
import type { MigratorMenu } from '../../index';
import { MENU_ID } from '../../index';

// cmigrator
export const MIGRATOR_MENU_LIST: MigratorMenu[] = [
  {
    category: {
      id: MENU_ID.SOURCE_COMPUTING,
      name: i18n.t('MENU.SOURCE_COMPUTING._NAME'),
    },
    menu: {
      id: MENU_ID.SOURCE_SERVICES,
      name: i18n.t('MENU.SOURCE_COMPUTING.SOURCE_SERVICES'),
    },
  },
];
