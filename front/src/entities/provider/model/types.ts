export interface IProviderResponse {
  output: string[];
}

interface Location {
  display: string;
  latitude: number;
  longitude: number;
}

interface Region {
  description: string;
  location: Location;
  regionId: string;
  regionName: string;
  zones: string[];
}

export interface IRegionOfProviderResponse {
  regions: Region[];
}
