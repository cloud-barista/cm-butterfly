export type RecommendedModelTableType =
  | 'name'
  | 'id'
  | 'description'
  | 'label'
  | 'spec'
  | 'image'
  | 'rootDiskType'
  | 'rootDiskSize'
  | 'userPassword'
  | 'connection'
  | 'estimateCost';

interface Vm {
  commonImage: string;
  commonSpec: string;
  description: string;
  label: string | null;
  name: string;
  subGroupSize: string;
}

interface TargetInfra {
  description: string;
  installMonAgent: string;
  label: string | null;
  name: string;
  systemLabel: string;
  vm: Vm[];
}

export interface IRecommendModelResponse {
  description: string;
  status: string;
  targetInfra: TargetInfra;
}

interface EstimateCostSpecDetail {
  calculatedMonthlyPrice: number;
  currency: string;
  id: number;
  lastUpdatedAt: string;
  memory: string;
  originalPricePolicy: string;
  osType: string;
  price: string;
  priceDescription: string;
  pricePolicy: string;
  productDescription: string;
  storage: string;
  unit: string;
  vCpu: string;
}

interface EstimateCostSpecResult {
  estimateForecastCostSpecDetailResults: EstimateCostSpecDetail[];
}

export interface IEsimateCostSpecResponse {
  result: {
    esimateCostSpecResults: EstimateCostSpecResult[];
  };
}
