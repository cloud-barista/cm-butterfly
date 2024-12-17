import { defineStore } from 'pinia';
import { ref } from 'vue';
import { IConnectionConfig } from '@/entities/credentials/model/types.ts';

export const useConfigStore = defineStore('CREDENTIALS', () => {
  const models = ref<IConnectionConfig[]>([]);

  function getConfig() {
    return models.value;
  }

  function setConfig(configList: IConnectionConfig[]) {
    models.value = configList;
  }

  return { models, getConfig, setConfig }; // models를 반환하도록 추가
});
