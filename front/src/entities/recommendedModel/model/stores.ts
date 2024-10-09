import { defineStore } from 'pinia';
import type { IRecommendedModel } from './types';

export const useRecommendedModelStore = defineStore('RECOMMENDED_MODEL', {
  state: () => ({
    recommendedModels: [
      {
        name: 'recommendedmodelname-01',
        id: '100001',
        description: 'recommendedmodeldescription-01',
        label: 'Rehosted vm',
        spec: 'aws-ap-northeast-2-t2-small',
        image: 'ubuntu 18.04',
        rootDiskType: 'default',
        rootDiskSize: 'default',
        userPassword: 'qwerqwerqwer',
        connection: 'aws-seoul-conname01',
        estimateCost: '12.800/M',
      },
      {
        name: 'recommendedmodelname-02',
        id: '100002',
        description: 'recommendedmodeldescription-02',
        label: 'Rehosted vm',
        spec: 'aws-ap-northeast-2-t2-small',
        image: 'ubuntu 18.04',
        rootDiskType: 'default',
        rootDiskSize: 'default',
        userPassword: 'qwerqwerqwer',
        connection: 'aws-seoul-conname01',
        estimateCost: '12.800/M',
      },
    ] as IRecommendedModel[],
  }),
  getters: {
    getRecommendedModelById: state => (id: string) => {
      return (
        state.recommendedModels.find((model: IRecommendedModel) => {
          return model.id === id;
        }) || null
      );
    },
  },
  actions: {
    setRecommendedModel(apiRecommendedModel: IRecommendedModel) {
      this.recommendedModels = [...this.recommendedModels, apiRecommendedModel];
    },
  },
});
