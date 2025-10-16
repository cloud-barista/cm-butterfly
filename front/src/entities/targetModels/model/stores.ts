import { defineStore } from 'pinia';
import { ITargetModelResponse } from '@/entities/targetModels/model/types';
import { ref } from 'vue';

export const useTargetModelStore = defineStore('TARGETMODEL', () => {
  const models = ref<ITargetModelResponse[]>([]);

  function getModels() {
    return models;
  }
  function getTargetModelById(
    modelId: string,
  ): ITargetModelResponse | undefined {
    return models.value?.find(el => el.id === modelId);
  }

  function setTargetModel(targetModelList: ITargetModelResponse[]) {
    models.value = targetModelList;
  }

  return { getModels, getTargetModelById, setTargetModel };
});
