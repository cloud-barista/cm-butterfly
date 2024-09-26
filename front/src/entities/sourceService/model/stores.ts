import { ref, Ref } from 'vue';
import {
  ISourceService,
  ISourceServiceResponse,
  SourceServiceStatus,
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
        services.value = _services.map(service => ({
          id: service.id,
          name: service.name,
          description: service.description,
          connectionCount: service.connection,
          connectionIds: [],
          status: SourceServiceStatus.unknown,
        }));
      } else {
        services.value = _services;
      }
    }

    function isSourceServiceResponse(
      _services: ISourceService[] | ISourceServiceResponse,
    ): _services is ISourceServiceResponse {
      return (_services as ISourceServiceResponse)[0].target_info !== undefined;
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
