// src/entities/credentials/model/credentialsDetailModel.ts
import { useConfigStore } from '@/entities/credentials/model/stores';
import { IConnectionConfig } from '@/entities/credentials/model/types';
import { useDefinitionTableModel } from '@/shared/hooks/table/definitionTable/useDefinitionTableModel';
import { ref, watch } from 'vue';
import { showErrorMessage } from '@/shared/utils'; // showErrorMessage 임포트

type CredentialDetailTableType = 'Provider' | 'CredentialName' | 'KeyValueInfo';

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
      { label: 'Provider', name: 'Provider' },
      { label: 'Credential Name', name: 'CredentialName' },
      { label: 'Key-Value Info', name: 'KeyValueInfo' },
    ];
  }

  // 테이블 데이터 설정 함수
  function setDefineTableData(name: string) {
    const credential = configStore.getConfigByName(name);
    if (credential) {
      const keyValueInfo = credential.KeyValueInfoList.map(
        (item: { Key: string; Value: string }) => `${item.Key}: ${item.Value}`,
      ).join(', ');
      tableModel.tableState.data = {
        Provider: credential.ProviderName,
        CredentialName: credential.CredentialName,
        KeyValueInfo: keyValueInfo,
      };
    } else {
      tableModel.tableState.data = {};
      showErrorMessage('Error', '선택한 Credential을 찾을 수 없습니다.');
    }
    tableModel.tableState.loading = false;
  }

  // Credential 데이터를 로드하는 함수
  function loadCredentialData(name: string | null) {
    tableModel.tableState.loading = true;
    if (name) {
      setDefineTableData(name);
    } else {
      tableModel.tableState.data = {};
      tableModel.tableState.loading = false;
    }
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
