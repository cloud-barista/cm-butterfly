// Load Test Scenario Catalog Types
export interface ILoadTestScenarioCatalog {
  id: number;
  name: string;
  description: string;
  duration: string;
  rampUpSteps: string;
  rampUpTime: string;
  virtualUsers: string;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ILoadTestScenarioCatalogsResult {
  loadTestScenarioCatalogs: ILoadTestScenarioCatalog[];
  totalRow: number;
}

export interface ILoadTestScenarioCatalogsResponse {
  code: number;
  result: ILoadTestScenarioCatalogsResult;
  successMessage: string;
}

export interface ICreateLoadTestScenarioCatalogRequest {
  name: string;
  description: string;
  duration: string;
  rampUpSteps: string;
  rampUpTime: string;
  virtualUsers: string;
}

export interface IUpdateLoadTestScenarioCatalogRequest {
  name?: string;
  description?: string;
  duration?: string;
  rampUpSteps?: string;
  rampUpTime?: string;
  virtualUsers?: string;
}

export type LoadTestScenarioCatalogTableType =
  | 'name'
  | 'id'
  | 'description'
  | 'virtualUsers'
  | 'duration'
  | 'rampUpTime'
  | 'rampUpSteps'
  | 'createdAt'
  | 'updatedAt'
  | 'action';
