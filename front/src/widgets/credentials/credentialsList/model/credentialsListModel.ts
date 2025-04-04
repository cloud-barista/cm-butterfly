// src/widgets/credentials/credentialsList/model/credentialsListModel.ts
import { useToolboxTableModel } from '@/shared/hooks/table/toolboxTable/useToolboxTableModel';
import { useConfigStore } from '@/entities/credentials/model/stores';
import { IConnectionConfig } from '@/entities/credentials/model/types';
import { ref, watch } from 'vue';
import { formatDate } from '@/shared/utils';

// Credential 테이블 필드 타입 정의
type CredentialTableType = 'checkbox' | 'CredentialName' | 'ProviderName';

export function useCredentialsListModel() {
  // Toolbox 테이블 모델 초기화
  const tableModel =
    useToolboxTableModel<
      Partial<Record<CredentialTableType | 'originalData', any>>
    >();

  // Credentials 스토어 접근
  const configStore = useConfigStore();

  // 스토어에서 Credential 목록 가져오기
  const credentials = configStore.getConfig();

  // 테이블 필드 및 검색 설정 초기화
  function initToolBoxTableModel() {
    tableModel.tableState.fields = [
      { name: 'checkbox', label: 'Check' },
      { name: 'CredentialName', label: 'Credential Name' },
      { name: 'ProviderName', label: 'Provider' },
    ];

    tableModel.querySearchState.keyItemSet = [
      {
        title: 'Columns',
        items: [
          { name: 'CredentialName', label: 'Credential Name' },
          { name: 'ProviderName', label: 'Provider' },
        ],
      },
    ];
  }

  // Credential 데이터를 테이블에 적합한 형식으로 조직
  function organizeCredentialTableItem(credential: any) {
    const organizedDatum: Partial<
      Record<CredentialTableType | 'originalData', any>
    > = {
      checkbox: '', // 체크박스 선택을 위한 플레이스홀더
      CredentialName: credential.CredentialName,
      ProviderName: credential.ProviderName,
      originalData: credential,
    };
    return organizedDatum;
  }

  // 스토어의 Credential 목록 변경을 감지하고 테이블 업데이트
  watch(
    credentials,
    newCredentials => {
      tableModel.tableState.items = newCredentials.map(credential =>
        organizeCredentialTableItem(credential),
      );
    },
    { immediate: true },
  );

  return {
    tableModel,
    credentials,
    initToolBoxTableModel,
    configStore,
  };
}
