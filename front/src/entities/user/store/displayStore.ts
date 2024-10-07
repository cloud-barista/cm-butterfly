import { defineStore } from 'pinia';

export const DisplayStore = defineStore('display', {
  state: () => ({
    visibleSidebar: false,
    // sidebarType: 'primary',
    isInitialized: false,
  }),
  getters: {},
  actions: {},
});
