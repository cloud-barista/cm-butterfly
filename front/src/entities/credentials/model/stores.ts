import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ICredential } from '@/entities/credentials/model/types';

export const useConfigStore = defineStore('CREDENTIALS', () => {
  const models = ref<ICredential[]>([]);
  const configStoreInfo = ref<ICredential | null>(null);

  function getConfig() {
    return models.value;
  }

  function setConfig(configList: ICredential[]) {
    models.value = configList;
  }

  function getConfigByName(name: string): ICredential | undefined {
    return models.value.find(config => config.CredentialName === name);
  }

  function addCredential(credential: ICredential) {
    models.value.push(credential);
  }

  function setConfigStoreInfo(config: ICredential) {
    configStoreInfo.value = config;
  }

  function removeCredentials(credentialNames: string[]) {
    models.value = models.value.filter(
      credential => !credentialNames.includes(credential.CredentialName),
    );
  }

  return {
    models,
    getConfig,
    setConfig,
    getConfigByName,
    addCredential,
    removeCredentials,
    configStoreInfo,
  };
});
