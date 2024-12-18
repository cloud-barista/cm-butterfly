// src/widgets/credentials/credentialsList/model/credentialsListModel.ts
import { useToolboxTableModel } from '@/shared/hooks/table/toolboxTable/useToolboxTableModel';
import { useConfigStore } from '@/entities/credentials/model/stores';
import { IConnectionConfig } from '@/entities/credentials/model/types';
import { ref, watch } from 'vue';
import { formatDate } from '@/shared/utils';

// Credential 테이블 필드 타입 정의
type CredentialTableType =
  | 'checkbox'
  | 'configName'
  | 'providerName'
  | 'regionDetail.regionName'
  | 'regionZoneInfo.assignedZone'
  | 'credentialName'
  | 'driverName';

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
      { name: 'configName', label: 'Name' },
      { name: 'providerName', label: 'Cloud Provider' },
      { name: 'regionDetail.regionName', label: 'Region' },
      { name: 'regionZoneInfo.assignedZone', label: 'Zone' },
      { name: 'credentialName', label: 'Credential' },
      { name: 'driverName', label: 'Driver' },
    ];

    tableModel.querySearchState.keyItemSet = [
      {
        title: 'Columns',
        items: [
          { name: 'configName', label: 'Name' },
          { name: 'providerName', label: 'Cloud Provider' },
          { name: 'regionDetail.regionName', label: 'Region' },
          { name: 'regionZoneInfo.assignedZone', label: 'Zone' },
          { name: 'credentialName', label: 'Credential' },
          { name: 'driverName', label: 'Driver' },
        ],
      },
    ];
  }

  // Credential 데이터를 테이블에 적합한 형식으로 조직
  function organizeCredentialTableItem(config: IConnectionConfig) {
    const organizedDatum: Partial<
      Record<CredentialTableType | 'originalData', any>
    > = {
      checkbox: '', // 체크박스 선택을 위한 플레이스홀더
      configName: config.configName,
      providerName: config.providerName,
      'regionDetail.regionName': config.regionDetail.regionName,
      'regionZoneInfo.assignedZone': config.regionZoneInfo.assignedZone,
      credentialName: config.credentialName,
      driverName: config.driverName,
      originalData: config,
    };
    return organizedDatum;
  }

  // 스토어의 Credential 목록 변경을 감지하고 테이블 업데이트
  watch(
    credentials,
    newConfigs => {
      tableModel.tableState.items = newConfigs.map(
        (config: IConnectionConfig) => organizeCredentialTableItem(config),
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
