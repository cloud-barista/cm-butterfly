import { defineStore } from 'pinia';
import {
  IMigratorMenu,
  MENU_ID,
  MigratorMenu,
} from '@/entities/menu/model/types';

export const useMigratorMenuStore = defineStore('MIGRATOR_MENU', {
  state: () => ({
    migratorMenu: [] as MigratorMenu[],
  }),
  getters: {},
  actions: {
    setMigratorMenu(apiMenu: IMigratorMenu) {
      if (apiMenu.menus === null) {
        const menus: MigratorMenu[] = [
          {
            category: {
              id: MENU_ID.MIGRATIONS,
              name: 'Overview',
            },
            menu: [],
          },
        ];
        menus[0].menu = [
          ...menus[0].menu,
          {
            id: apiMenu.id,
            name: apiMenu.displayname,
          },
        ];
        this.migratorMenu = [...this.migratorMenu, ...menus];
      } else if (Array.isArray(apiMenu.menus) && apiMenu.menus?.length > 0) {
        const m_menus = apiMenu.menus?.map((menu: IMigratorMenu) => {
          if (menu.isaction === 'false') {
            // TODO: menu.isAction === false인 경우에 대한 처리 필요 -> lsb 처리
            return {
              id: menu.id,
              name: menu.displayname,
              submenus: [
                menu.menus?.map((submenu: IMigratorMenu) => {
                  return {
                    id: submenu.id,
                    name: submenu.displayname,
                  };
                }),
              ],
            };
          } else if (menu.isaction === 'true') {
            return {
              id: menu.id,
              name: menu.displayname,
            };
          }
        });
        this.migratorMenu = [
          ...this.migratorMenu,
          {
            category: {
              id: apiMenu.id,
              name: apiMenu.displayname,
            },
            menu: m_menus,
          },
        ];
      }
    },
  },
});
