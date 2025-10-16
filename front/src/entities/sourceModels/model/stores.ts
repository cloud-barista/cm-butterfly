import { defineStore } from 'pinia';
import { ISourceModelResponse } from '@/entities/sourceModels/model/types';
import { ref } from 'vue';

export const useSourceModelStore = defineStore('SOURCEMODEL', () => {
  const models = ref<ISourceModelResponse[]>([]);

  function getModels() {
    return models;
  }
  function getSourceModelById(
    modelId: string,
  ): ISourceModelResponse | undefined {
    return models.value?.find(el => el.id === modelId);
  }

  function setSourceModel(sourceModelList: ISourceModelResponse[]) {
    models.value = sourceModelList;
  }

  return { getModels, getSourceModelById, setSourceModel };
});
