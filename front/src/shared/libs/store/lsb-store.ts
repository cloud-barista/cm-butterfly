import { defineStore } from 'pinia';

export const useLSBStore = defineStore('lsb', {
  state: () => ({
    submenuInfo: {
      parentMenuName: '',
      submenus: [],
    },
  }),
  getters: {},
  actions: {
    setSubmenuInfo(parentMenuName: string, submenus: any) {
      this.submenuInfo = {
        parentMenuName,
        submenus: submenus,
      };
    },
  },
});
