import { defineStore } from 'pinia';

export interface JsonConvertStoreState {
  jsonEditedByUser: JSON;
  jsonAfterConverted: JSON;
}

export const useJsonConvertStore = defineStore('json-convert-store', {
  state: (): JsonConvertStoreState => ({
    jsonEditedByUser: {} as JSON,
    jsonAfterConverted: {} as JSON,
  }),
  getters: {},
  actions: {
    setJsonEditedByUser(json: JSON) {
      this.jsonEditedByUser = json;
    },
    setJsonAfterConverted(json: JSON) {
      this.jsonAfterConverted = json;
    },
  },
});
