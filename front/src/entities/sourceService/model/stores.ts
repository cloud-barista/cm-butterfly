import { ref } from 'vue';
import {
  ISourceService,
  ISourceServiceResponse,
  ISourceServiceResponseElement,
  IInfraSourceGroupResponse,
} from '@/entities/sourceService/model/types';
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
    }));
  }

  function getServiceById(serviceId: string) {
    return (
      services.value.find((service: ISourceService) => {
        return service.id === serviceId;
      }) || null
    );
  }

  function mappinginfraModel(
    sgId: string,
    infraSourceGroupResponse: IInfraSourceGroupResponse,
  ) {
    const sg = getServiceById(sgId);

    if (sg) {
      sg.infraModel = infraSourceGroupResponse;
    }
  }

  function mappingSoftwareModel(
    sgId: string,
    softwareData: any,
  ) {
    const sg = getServiceById(sgId);

    if (sg) {
      sg.softwareModel = softwareData;
    }
  }

  function mappingSourceGroupStatus(sgId: string, status: string) {
    const sg = getServiceById(sgId);

    if (sg) {
      sg.status = status;
    }
  }

  return {
    services,
    serviceWithStatus,
    setService,
    getServiceById,
    mappinginfraModel,
    mappingSoftwareModel,
    mappingSourceGroupStatus,
  };
});
