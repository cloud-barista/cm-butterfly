import {
  useAxiosPost,
  IAxiosResponse,
  RequestBodyWrapper,
} from '@/shared/libs';
import JwtTokenProvider from '@/shared/libs/token';

const GET_ALL_VPCS = 'getallvnet';
const CREATE_VPC = 'postvnet';
const GET_PROVIDER_LIST = 'getproviderList';
const GET_REGION_LIST = 'getregionlist';
const DELETE_VPC = 'delvnet';

const jwtTokenProvider = JwtTokenProvider.getProvider();
const { access_token } = jwtTokenProvider.getTokens();

export function useGetAllVPCs<T, D>(workspaceData: D | null) {
  const requestBodyWrapper: Required<
    Pick<RequestBodyWrapper<D | null>, 'request'>
  > = {
    request: workspaceData,
  };
  return useAxiosPost<IAxiosResponse<T>, RequestBodyWrapper<D | null>>(
    GET_ALL_VPCS,
    requestBodyWrapper,
    {
      headers: {
        Authorization: `${access_token}`,
      },
    },
  );
}

export function useCreateVPC<T, D>(vpcData: D | null) {
  const requestBodyWrapper: Required<
    Pick<RequestBodyWrapper<D | null>, 'request'>
  > = {
    request: vpcData,
  };

  return useAxiosPost<IAxiosResponse<T>, RequestBodyWrapper<D | null>>(
    CREATE_VPC,
    requestBodyWrapper,
    {
      headers: {
        Authorization: `${access_token}`,
      },
    },
  );
}

export function useDeleteVPC<T, D>(vpcData: D | null) {
  const requestBodyWrapper: Required<
    Pick<RequestBodyWrapper<D | null>, 'request'>
  > = {
    request: vpcData,
  };

  return useAxiosPost<IAxiosResponse<T>, RequestBodyWrapper<D | null>>(
    DELETE_VPC,
    requestBodyWrapper,
    {
      headers: {
        Authorization: `${access_token}`,
      },
    },
  );
}

// {
//   "pathParams": {
//       "nsId": "ns01" // workspaceId
//   },
//   "request": {
//       "cidrBlock": "10.0.0.0/16", // cidrblock
//       "connectionName": "aws-ap-northeast-2", // connectionname (selectedConnection)
//       "name": "aws-seoul-vnet", // vpc name
//       "subnetInfoList": [ // with subnetInfo
//           {
//               "ipv4_CIDR": "10.0.0.0/18",
//               "name": "aws-seoul-subnet"
//           }
//       ]
//   }
// }

export function useGetProviderList<T, D>() {
  return useAxiosPost<IAxiosResponse<T>, D | null>(GET_PROVIDER_LIST, null, {
    headers: {
      Authorization: `${access_token}`,
    },
  });
}

export function useGetRegionList<T, D>() {
  return useAxiosPost<IAxiosResponse<T>, D | null>(GET_REGION_LIST, null, {
    headers: {
      Authorization: `${access_token}`,
    },
  });
}
