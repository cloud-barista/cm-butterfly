import { ref, Ref } from 'vue';
import { ISourceService } from '@/entities/sourceService/model/types.ts';
import { defineStore } from 'pinia';

const NAMESPACE = 'SOURCESERVICE';

export interface ISourceServiceStore {
  services: Ref<ISourceService[]>;
  setService: (val: any) => void;
  // setService: (val: ISourceService[]) => void;

  getServiceById: (id: string) => ISourceService | null;
}

export const useSourceServiceStore = defineStore(
  NAMESPACE,
  (): ISourceServiceStore => {
    const services = ref<ISourceService[]>([]);

    function setService(_services: ISourceService[]) {
      services.value = _services;
    }

    function getServiceById(serviceId: string) {
      return (
        services.value.find((service: ISourceService) => {
          return service.id === serviceId;
        }) || null
      );
    }

    return {
      services,
      setService,
      getServiceById,
    };
  },
);
