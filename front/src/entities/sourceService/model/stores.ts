import { ref, Ref } from 'vue';
import {
  ISourceService,
  ISourceServiceResponse,
  SourceServiceStatusType,
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

    function setService(_services: ISourceServiceResponse) {
      services.value = _services.source_group.map(service => ({
        id: service.id,
        name: service.name,
        description: service.description,
        connectionCount:
          service.connection_info_status_count.connection_info_total,
        connectionIds: [],
        status: 'S0004',
      }));
    }

    function getServiceById(serviceId: string) {
      return (
        services.value.find((service: ISourceService) => {
          return service.id === serviceId;
        }) || null
      );
    }

    function setServiceStatus(
      serviceId: string,
      status: SourceServiceStatusType,
    ) {
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
