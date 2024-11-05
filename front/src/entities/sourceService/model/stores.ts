import { ref, Ref, watchEffect } from 'vue';
import {
  ISourceService,
  ISourceServiceResponse,
  SourceServiceStatusType,
  ISourceServiceResponseElement,
} from '@/entities/sourceService/model/types.ts';
import { defineStore } from 'pinia';

const NAMESPACE = 'SOURCESERVICE';

export const useSourceServiceStore = defineStore(NAMESPACE, () => {
  const services = ref<ISourceService[]>([]);
  const serviceWithStatus = ref<ISourceServiceResponseElement | null>();

  function setService(_services: ISourceServiceResponse) {
    services.value = _services.source_group.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      connectionCount:
        service.connection_info_status_count.connection_info_total,
      connectionIds: [],
      status: 'S0004',
      // status:
    }));
  }

  function setServiceWithConnectionStatus(
    service: ISourceServiceResponseElement,
  ) {
    serviceWithStatus.value = service;
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
    serviceWithStatus,
    setService,
    getServiceById,
    setServiceStatus,
    setServiceWithConnectionStatus,
  };
});
