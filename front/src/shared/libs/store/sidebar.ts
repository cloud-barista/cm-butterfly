import { defineStore } from 'pinia';

export const useSidebar = defineStore('sidebar', {
  state: () => ({
    isGnbToolboxShown: true,
    isCollapsed: false,
    isMinimized: false,
    isHovered: false,
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
    toggleHover(value: boolean) {
      this.isHovered = value;
    },
    initState() {
      this.breadCrumbs = [];
    },
  },
});
