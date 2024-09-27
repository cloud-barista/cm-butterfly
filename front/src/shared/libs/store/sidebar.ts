import { defineStore } from 'pinia';

export const useSidebar = defineStore('sidebar', {
  state: () => ({
    isGnbToolboxShown: true,
    isCollapsed: false,
    isMinimized: false,
    breadCrumbs: [],
  }),
  getters: {},
  actions: {
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed;
    },
    toggleMinimize() {
      this.isMinimized = !this.isMinimized;
    },
    initState() {
      this.breadCrumbs = [];
    },
  },
});
