import { ref, Ref } from 'vue';
import {
  ISourceService,
  ISourceServiceResponse,
} from '@/entities/sourceService/model/types.ts';
import { defineStore } from 'pinia';

const NAMESPACE = 'SOURCESERVICE';

export interface ISourceServiceStore {
  services: Ref<ISourceService[]>;
  setService(val: any): void;
  getServiceById: (id: string) => ISourceService | null;
  setServiceStatus(serviceId: string, status: any): void;
}

export const useSourceServiceStore = defineStore(
  NAMESPACE,
  (): ISourceServiceStore => {
    const services = ref<ISourceService[]>([]);

    function setService(_services: ISourceService[] | ISourceServiceResponse) {
      if (isSourceServiceResponse(_services)) {
        //가공로직
      } else {
        services.value = _services;
      }
    }

    function isSourceServiceResponse(
      _services: ISourceService[] | ISourceServiceResponse,
    ): _services is ISourceServiceResponse {
      return (_services as ISourceServiceResponse).temp !== undefined;
    }

    function getServiceById(serviceId: string) {
      return (
        services.value.find((service: ISourceService) => {
          return service.id === serviceId;
        }) || null
      );
    }

    function setServiceStatus(serviceId: string, status: any) {
      const service = getServiceById(serviceId);
      if (service) {
        service.status = status;
      }
    }

    return {
      services,
      setService,
      getServiceById,
      setServiceStatus,
    };
  },
);
