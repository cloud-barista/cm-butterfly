import { useToolboxTableModel } from '@/shared/hooks/table/toolboxTable/useToolboxTableModel';
import {
  IEsimateCostSpecResponse,
  IRecommendModelResponse,
} from '@/entities/recommendedModel/model/types';
import { ref, watch } from 'vue';
import { useSourceModelStore } from '@/entities';
import { useAuthStore } from '@/shared/libs/store/auth';
import {
  IProviderResponse,
  IRegionOfProviderResponse,
} from '@/entities/provider/model/types';
import {
  useAxiosPost,
  IAxiosResponse,
  RequestBodyWrapper,
} from '@/shared/libs';

interface ISelectMenu {
  name: string;
  label: string;
  type: string;
}

interface IExtendRecommendModelResponse extends IRecommendModelResponse {
  estimateResponse?: IEsimateCostSpecResponse;
}

// Software Migration List API 응답 타입
interface ISoftwareMigrationListResponse {
  // API 응답 구조에 맞게 정의 필요
  [key: string]: any;
}

// Software 전용 테이블 타입
type SoftwareMigrationTableType = 
  | 'migrationType'
  | 'description'
  | 'status'
  | 'createdAt'
  | 'originalData';

export function useRecommendedSoftwareModel() {
  const tableModel =
    useToolboxTableModel<
      Partial<Record<SoftwareMigrationTableType, any>>
    >();
  const sourceModelStore = useSourceModelStore();
  const targetRecommendModel = ref<IExtendRecommendModelResponse | null>(null);
  const userStore = useAuthStore();
  
  // Software Migration List API 호출
  const getSoftwareMigrationList = useAxiosPost<
    IAxiosResponse<ISoftwareMigrationListResponse>,
    RequestBodyWrapper<{ sourceSoftwareModel: any }>
  >('Get-Migration-List', {
    request: {
      sourceSoftwareModel: null
    }
  });

  function initToolBoxTableModel() {
    tableModel.initState();
    // Software 전용 테이블 컬럼으로 변경
    tableModel.tableState.fields = [
      { name: 'migrationType', label: 'Migration Type' },
      { name: 'description', label: 'Description' },
      { name: 'status', label: 'Status' },
      { name: 'createdAt', label: 'Created At' },
    ];

    tableModel.querySearchState.keyItemSet = [
      {
        title: 'columns',
        items: [
          { name: 'migrationType', label: 'Migration Type' },
          { name: 'description', label: 'Description' },
          { name: 'status', label: 'Status' },
          { name: 'createdAt', label: 'Created At' },
        ],
      },
    ];

    tableModel.tableState.selectIndex = [0];
  }

  // Software Migration List 조회
  async function getSoftwareMigrationListData(sourceSoftwareModel: any) {
    const requestWrapper: RequestBodyWrapper<{ sourceSoftwareModel: any }> = {
      request: {
        sourceSoftwareModel: sourceSoftwareModel
      }
    };
    
    const response = await getSoftwareMigrationList.execute(requestWrapper);
    
    if (response.data.responseData) {
      // 응답 데이터를 테이블 형식으로 변환
      const migrationData = response.data.responseData;
      // 실제 API 응답 구조에 맞게 수정 필요
      const tableData = {
        migrationType: migrationData.migrationType || 'N/A',
        description: migrationData.description || 'N/A',
        status: migrationData.status || 'N/A',
        createdAt: migrationData.createdAt || 'N/A',
        originalData: migrationData
      };
      
      tableModel.tableState.items = [tableData];
    }
    
    return response;
  }

  // Provider 선택 메뉴 생성 (기존 함수 유지)
  function generateProviderSelectMenu(
    providerResponse: IProviderResponse,
  ): Array<ISelectMenu> {
    const menu: Array<ISelectMenu> = [];

    providerResponse.output.forEach(provider => {
      menu.push({
        name: provider,
        label: provider,
        type: 'item',
      });
    });
    menu.sort((a, b) => a.label.localeCompare(b.label));

    return menu;
  }

  // Region 선택 메뉴 생성 (기존 함수 유지)
  function generateRegionSelectMenu(
    regionOfProviderResponse: IRegionOfProviderResponse,
  ): Array<ISelectMenu> {
    const menu: Array<ISelectMenu> = [];

    regionOfProviderResponse.regions.forEach(region => {
      menu.push({
        name: region.regionId,
        label: `${region.location.display} / ${region.regionName}`,
        type: 'item',
      });
    });
    menu.sort((a, b) => a.label.localeCompare(b.label));
    return menu;
  }

  // 기존 함수들은 Software 전용으로 수정하거나 제거
  function setTargetRecommendModel(
    _targetRecommendModel: IExtendRecommendModelResponse,
  ) {
    targetRecommendModel.value = _targetRecommendModel;
  }

  function setTableStateItem() {
    // Software 전용 테이블 상태 설정
    if (targetRecommendModel.value) {
      // Software 데이터에 맞게 수정
    }
  }

  watch(targetRecommendModel, nv => {
    if (nv) setTableStateItem();
  });

  return {
    userStore,
    tableModel,
    initToolBoxTableModel,
    targetRecommendModel,
    sourceModelStore,
    setTableStateItem,
    setTargetRecommendModel,
    getSoftwareMigrationListData, // 새로운 함수 추가
    getSoftwareMigrationList,     // API 함수 추가
    generateProviderSelectMenu,    // 기존 함수 유지
    generateRegionSelectMenu,      // 기존 함수 유지
  };
}
