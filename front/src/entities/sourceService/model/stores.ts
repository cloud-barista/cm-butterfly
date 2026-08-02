import { ref } from 'vue';
import {
  ISourceService,
  ISourceServiceResponse,
  ISourceServiceResponseElement,
  IInfraSourceGroupResponse,
} from '@/entities/sourceService/model/types';
import { defineStore } from 'pinia';
import type {
  ISourceConnectionStatusCountResponse,
  ISourceConnectionOutcome,
} from '@/entities/sourceService/model/types';

const NAMESPACE = 'SOURCESERVICE';

/**
 * Whether a source service can be reached, worked out from what the server reports
 * about its connections.
 *
 * The screen used to take its status from the *response of the refresh call*, whose
 * body says only that the refresh finished - the same `success` whether the servers
 * answered or not. A stopped server therefore showed as healthy. The state the server
 * actually reports travels in these counts, and this is the only thing that decides
 * what is shown.
 */
export function deriveSourceServiceStatus(
  counts: ISourceConnectionStatusCountResponse | undefined,
): string {
  if (!counts || counts.connection_info_total === 0) return 'unknown';

  const failed = counts.count_connection_failed + counts.count_agent_failed;
  const succeeded = counts.count_connection_success + counts.count_agent_success;

  if (failed === 0 && succeeded > 0) return 'success';
  if (succeeded === 0) return 'failed';
  return 'partialSuccess';
}

export const useSourceServiceStore = defineStore(NAMESPACE, () => {
  const services = ref<ISourceService[]>([]);
  const serviceWithStatus = ref<ISourceServiceResponseElement | null>();

  function setService(_services: ISourceServiceResponse) {
    // honeybee returns null instead of an empty array when there are no source groups.
    // Fall back to an empty array to avoid a null.map crash in a clean environment (0 groups).
    services.value = (_services.source_group ?? []).map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      connectionCount:
        service.connection_info_status_count.connection_info_total,
      connectionIds: [],
      status: deriveSourceServiceStatus(service.connection_info_status_count),
      // Declared here even though it is filled in later: a property added to an existing
      // object after the fact is not observed, so anything watching it would never see it
      // arrive.
      connectionOutcomes: [],
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

  /**
   * Record what the server says about a service's connections.
   *
   * Takes the counts rather than a status string on purpose: a caller holding a
   * message from some other call cannot pass it off as the connection state.
   */
  function mappingSourceGroupStatus(
    sgId: string,
    counts: ISourceConnectionStatusCountResponse | undefined,
  ) {
    const sg = getServiceById(sgId);

    if (sg) {
      sg.status = deriveSourceServiceStatus(counts);
      if (counts) {
        sg.connectionCount = counts.connection_info_total;
      }
    }
  }

  /** Keep what the server said about each connection, so a failure can be explained. */
  function mappingConnectionOutcomes(
    sgId: string,
    outcomes: ISourceConnectionOutcome[],
  ) {
    const sg = getServiceById(sgId);

    if (sg) {
      sg.connectionOutcomes = outcomes;
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
    mappingConnectionOutcomes,
  };
});
