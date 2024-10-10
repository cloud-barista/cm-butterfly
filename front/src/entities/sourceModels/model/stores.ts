import { defineStore } from 'pinia';
import { formatDate } from '@/shared/utils';
import type { ISourceModel } from './types';

export const useSourceModelStore = defineStore('SOURCEMODEL', {
  state: () => ({
    models: [
      {
        id: '1',
        name: 'model1',
        description: 'model1 description',
        migrationType: 'migrationType',
        custom: 'Basic',
        createdDateTime: '2021-08-01',
        updatedDateTime: '2021-08-01',
        modelType: 'Source',
        customAndViewJSON: {},
        recommendModel: 'recommendModel',
      },
      {
        id: '2',
        name: 'model2',
        description: 'model2 description',
        migrationType: 'migrationType',
        custom: 'Custom',
        createdDateTime: '2021-08-01',
        updatedDateTime: '2021-08-01',
        modelType: 'Source',
        customAndViewJSON: {},
        recommendModel: 'recommendModel',
      },
    ] as ISourceModel[],
  }),
  getters: {
    getModelById: state => (id: string) => {
      return (
        state.models.find((model: ISourceModel) => {
          return model.id === id;
        }) || null
      );
    },
  },
  actions: {
    setModels(_models: ISourceModel[]) {
      this.models = _models.map(model => ({
        id: model.id,
        name: model.name,
        description: model.description,
        migrationType: model.migrationType,
        custom: model.custom,
        createdDateTime: formatDate(model.createdDateTime),
        updatedDateTime: formatDate(model.updatedDateTime),
        modelType: model.modelType,
        customAndViewJSON: model.customAndViewJSON,
        recommendModel: model.recommendModel,
      }));
    },
  },
});
