export type RecommendedModelTableType =
  | 'name'
  | 'id'
  | 'description'
  | 'spec'
  | 'image'
  | 'estimateCost';

export interface IRecommendedModel {
  name: string;
  id: string;
  description: string;
  label: string;
  spec: string;
  image: string;
  rootDiskType: string;
  rootDiskSize: string;
  userPassword: string;
  connection: string;
  estimateCost: string;
}

interface Vm {
  imageId: string;
  specId: string;
  description: string;
  label: string | null;
  name: string;
  subGroupSize: string;
}

interface TargetVmInfra {
  description: string;
  installMonAgent: string;
  label: string | null;
  name: string;
  systemLabel: string;
  subGroups: Vm[];
}

export interface IRecommendModelResponse {
  description: string;
  status: string;
  targetVmInfra: TargetVmInfra;
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
