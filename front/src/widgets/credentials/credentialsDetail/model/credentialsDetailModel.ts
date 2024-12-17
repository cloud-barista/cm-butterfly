// front/src/widgets/credentials/credentialsDetail/model/credentialsDetailModel.ts

import {
  useConfigStore,
  CredentialTableType,
} from '@/entities/credentials/model/stores.ts';
import { useDefinitionTableModel } from '@/shared/hooks/table/definitionTable/useDefinitionTableModel';
import { ref, watch } from 'vue';

export function useCredentialDetailModel() {
  const credentialStore = useConfigStore();
  const credentialId = ref<string | null>(null);
  const tableModel =
    useDefinitionTableModel<Record<CredentialTableType, any>>();

  function setCredentialId(_credentialId: string | null) {
    credentialId.value = _credentialId;
  }

  function initTable() {
    tableModel.initState();

    tableModel.tableState.fields = [
      { label: 'Credential Information', name: 'name' },
      { label: 'Credential Holder', name: 'credentialHolder' },
      { label: 'Credential Name', name: 'credentialName' },
      { label: 'Driver Name', name: 'driverName' },
      { label: 'Provider Name', name: 'providerName' },
      { label: 'Region', name: 'regionDetail.regionName' },
      { label: 'Description', name: 'description' },
      { label: 'Location', name: 'location' },
      { label: 'Zones', name: 'zones' },
      { label: 'Region Representative', name: 'regionRepresentative' },
      { label: 'Verified', name: 'verified' },
      {
        label: 'Custom & View JSON',
        name: 'customAndViewJSON',
        disableCopy: true,
      },
      { label: 'Recommend Model', name: 'recommendModel', disableCopy: true },
    ];
  }

  function setDefineTableData(credentialId: string) {
    const credential = credentialStore.getCredentialById(credentialId);
    let data: Partial<Record<CredentialTableType, any>> = {};

    if (credential) {
      data = {
        name: credential.configName,
        credentialHolder: credential.credentialHolder,
        credentialName: credential.credentialName,
        driverName: credential.driverName,
        providerName: credential.providerName,
        regionDetail: credential.regionDetail.regionName,
        description: credential.regionDetail.description,
        location: `${credential.regionDetail.location.display} (Lat: ${credential.regionDetail.location.latitude}, Lon: ${credential.regionDetail.location.longitude})`,
        zones: credential.regionDetail.zones.join(', '),
        regionRepresentative: credential.regionRepresentative ? 'Yes' : 'No',
        verified: credential.verified ? 'Yes' : 'No',
        customAndViewJSON: '',
        recommendModel: '',
      };
    }
    return data;
  }

  function loadCredentialData(credentialId: string | null | undefined) {
    tableModel.tableState.loading = true;
    if (credentialId) {
      tableModel.tableState.data = setDefineTableData(credentialId);
    }
    tableModel.tableState.loading = false;
  }

  watch(credentialId, newVal => {
    loadCredentialData(newVal);
  });

  return {
    setCredentialId,
    credentialStore,
    initTable,
    tableModel,
  };
}
