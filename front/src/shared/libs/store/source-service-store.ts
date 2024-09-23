import { defineStore } from 'pinia';

export const useSourceServiceStore = defineStore('source-service-store', {
  state: () => ({
    sourceServiceName: '',
    sourceServiceDescription: '',
    sourceConnectionList: [] as string[],
  }),
  getters: {},
  actions: {
    setSourceConnectionList(connectionList: string[]) {
      this.sourceConnectionList = connectionList;
    },
  },
});
