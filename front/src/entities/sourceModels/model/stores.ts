import { defineStore } from 'pinia';
import { formatDate } from '@/shared/utils';
import type { ISourceModel } from './types';

export const dateType =
  new Date().getFullYear() +
  '-' +
  new Date().getMonth() +
  '-' +
  new Date().getDate() +
  ' ' +
  new Date().getHours() +
  ':' +
  new Date().getMinutes() +
  ':' +
  new Date().getSeconds();

export const useSourceModelStore = defineStore('SOURCEMODEL', {
  state: () => ({
    models: [
      {
        id: '10001',
        name: 'sourceservicename01-md01',
        description: 'model1 description',
        migrationType: 'Infra',
        custom: 'Basic',
        createdDateTime: dateType,
        updatedDateTime: dateType,
        modelType: 'Source',
        customAndViewJSON: {},
        recommendModel: [
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
          {
            name: 'recommendedmodelname-03',
            id: '100003',
            description: 'recommendedmodeldescription-03',
            label: 'Rehosted vm',
            spec: 'aws-ap-northeast-2-t2-small',
            image: 'ubuntu 18.04',
            rootDiskType: 'default',
            rootDiskSize: 'default',
            userPassword: 'qwerqwerqwer',
            connection: 'aws-seoul-conname01',
            estimateCost: '12.800/M',
          },
        ],
      },
      {
        id: '10002',
        name: 'sourceservicename01-md02',
        description: 'model2 description',
        migrationType: 'Software',
        custom: 'Custom',
        createdDateTime: dateType,
        updatedDateTime: dateType,
        modelType: 'Source',
        customAndViewJSON: {},
        recommendModel: [
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
          {
            name: 'recommendedmodelname-03',
            id: '100003',
            description: 'recommendedmodeldescription-03',
            label: 'Rehosted vm',
            spec: 'aws-ap-northeast-2-t2-small',
            image: 'ubuntu 18.04',
            rootDiskType: 'default',
            rootDiskSize: 'default',
            userPassword: 'qwerqwerqwer',
            connection: 'aws-seoul-conname01',
            estimateCost: '12.800/M',
          },
        ],
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
