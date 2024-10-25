import { defineStore } from 'pinia';
import { formatDate } from '@/shared/utils';
import type { ITargetModel } from './types';
import { dateType } from '@/entities/sourceModels';

export const useTargetModelStore = defineStore('TARGETMODEL', {
  state: () => ({
    targetModels: [
      {
        id: '10001',
        name: 'target model1',
        description: 'target model1 description',
        migrationType: 'migrationType',
        custom: 'Basic',
        createdDateTime: dateType,
        updatedDateTime: dateType,
        modelType: 'Target',
        customAndViewJSON: {},
        workflowTool: 'workflowTool',
      },
      {
        id: '10002',
        name: 'target model2',
        description: 'target model2 description',
        migrationType: 'migrationType',
        custom: 'Custom',
        createdDateTime: '2021-08-01',
        updatedDateTime: '2021-08-01',
        modelType: 'Target',
        customAndViewJSON: {},
        workflowTool: 'workflowTool',
      },
    ] as ITargetModel[],
  }),
  getters: {
    getTargetModelById: state => (id: string) => {
      return (
        state.targetModels.find((targetModel: ITargetModel) => {
          return targetModel.id === id;
        }) || null
      );
    },
  },
  actions: {
    setTargetModels(_targetModels: ITargetModel[]) {
      this.targetModels = _targetModels.map(targetModel => ({
        id: targetModel.id,
        name: targetModel.name,
        description: targetModel.description,
        migrationType: targetModel.migrationType,
        custom: targetModel.custom,
        createdDateTime: formatDate(targetModel.createdDateTime),
        updatedDateTime: formatDate(targetModel.updatedDateTime),
        modelType: targetModel.modelType,
        customAndViewJSON: targetModel.customAndViewJSON,
        workflowTool: targetModel.workflowTool,
      }));
    },
    setTargetModel(targetModel: ITargetModel) {
      this.targetModels = [...this.targetModels, targetModel];
    },
  },
});
