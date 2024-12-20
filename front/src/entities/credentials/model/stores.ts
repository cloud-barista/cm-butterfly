import { defineStore } from 'pinia';
import { ref } from 'vue';
import { IConnectionConfig } from '@/entities/credentials/model/types.ts';

export const useConfigStore = defineStore('CREDENTIALS', () => {
  const models = ref<IConnectionConfig[]>([]);
  const configStoreInfo = ref<IConnectionConfig | null>(null); // 추가된 상태

  function getConfig() {
    return models.value;
  }

  function setConfig(configList: IConnectionConfig[]) {
    models.value = configList;
  }

  function getConfigByName(name: string): IConnectionConfig | undefined {
    console.log('getConfigByName - searching for:', name);
    console.log(
      'getConfigByName - available configNames:',
      models.value.map(config => config.configName),
    );
    return models.value.find(config => config.configName === name);
  }
  function setConfigStoreInfo(config: IConnectionConfig) {
    configStoreInfo.value = config;
  }
  return { models, getConfig, setConfig, getConfigByName, configStoreInfo };
});
