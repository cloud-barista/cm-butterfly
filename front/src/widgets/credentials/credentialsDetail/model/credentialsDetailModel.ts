// src/entities/credentials/model/credentialsDetailModel.ts
import { useConfigStore } from '@/entities/credentials/model/stores';
import { IConnectionConfig } from '@/entities/credentials/model/types';
import { useDefinitionTableModel } from '@/shared/hooks/table/definitionTable/useDefinitionTableModel';
import { ref, watch } from 'vue';
import { showErrorMessage } from '@/shared/utils'; // showErrorMessage 임포트

type CredentialDetailTableType =
  | 'name'
  | 'id'
  | 'providerName'
  | 'regionDetail.regionName'
  | 'regionZoneInfo.assignedZone'
  | 'credentialName'
  | 'driverName'
  | 'verified'
  | 'credentialHolder'
  | 'regionRepresentative'
  | 'regionZoneInfoName';

export function useCredentialsDetailModel() {
  const configStore = useConfigStore();
  const credentialName = ref<string | null>(null);
  const tableModel =
    useDefinitionTableModel<Record<CredentialDetailTableType, any>>();

  // Credential Name 설정 함수
  function setCredentialName(name: string | null) {
    credentialName.value = name;
  }

  // 테이블 초기화
  function initTable() {
    tableModel.initState();

    tableModel.tableState.fields = [
      { label: 'Credential 정보', name: 'name' },
      { label: 'ID', name: 'id' },
      { label: 'Provider', name: 'providerName' },
      { label: 'Region', name: 'regionDetail.regionName' },
      { label: 'Zone', name: 'regionZoneInfo.assignedZone' },
      { label: 'Credential Name', name: 'credentialName' },
      { label: 'Driver', name: 'driverName' },
      { label: 'Verified', name: 'verified' },
      { label: 'Credential Holder', name: 'credentialHolder' },
      { label: 'Region Representative', name: 'regionRepresentative' },
      { label: 'Region Zone Info Name', name: 'regionZoneInfoName' },
    ];
  }

  // 테이블 데이터 설정 함수
  function setDefineTableData(name: string) {
    const credential = configStore.getConfigByName(name);
    let data: Partial<Record<CredentialDetailTableType, any>> = {};
    if (credential) {
      data = {
        name: credential.configName,
        id: credential.configName,
        providerName: credential.providerName,
        'regionDetail.regionName': credential.regionDetail.regionName,
        'regionZoneInfo.assignedZone': credential.regionZoneInfo.assignedZone,
        credentialName: credential.credentialName,
        driverName: credential.driverName,
        verified: credential.verified ? 'Yes' : 'No',
        credentialHolder: credential.credentialHolder,
        regionRepresentative: credential.regionRepresentative ? 'Yes' : 'No',
        regionZoneInfoName: credential.regionZoneInfoName,
      };
      tableModel.tableState.data = data;
    } else {
      // Credential이 없는 경우 처리
      tableModel.tableState.data = {};
      showErrorMessage('Error', '선택한 Credential을 찾을 수 없습니다.');
    }
    tableModel.tableState.loading = false;
  }

  // Credential 데이터를 로드하는 함수
  function loadCredentialData(name: string | null) {
    tableModel.tableState.loading = true;
    setDefineTableData(name);
  }

  // Credential Name 변경 감지
  watch(credentialName, newName => {
    loadCredentialData(newName);
  });

  return {
    setCredentialName,
    configStore,
    initTable,
    tableModel,
  };
}
