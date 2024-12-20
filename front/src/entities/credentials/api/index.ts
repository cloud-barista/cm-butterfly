import {
  IAxiosResponse,
  RequestBodyWrapper,
  useAxiosPost,
} from '@/shared/libs';
import { IGetConnconfigListResponse } from '@/entities/credentials/model/types.ts';

const GET_CONNECTION = 'Getconnconfiglist';
const GET_CONNECTION_BYID = 'GetconnconfiglisGetconnconfig';
const CREATE_CREDENTIAL = 'Register-Credential';

export function useGetConnconfigList() {
  return useAxiosPost<IAxiosResponse<IGetConnconfigListResponse>, null>(
    GET_CONNECTION,
    null,
  );
}

export type ICreateCredentialsResponse = ICreateCredentialsPayload;

export function useCreateCredentials(data: ICreateCredentialsPayload | null) {
  const requestWrapper: Required<
    Pick<RequestBodyWrapper<ICreateCredentialsPayload | null>, 'request'>
  > = {
    request: data,
  };

  return useAxiosPost<
    IAxiosResponse<ICreateCredentialsResponse>,
    Required<
      Pick<RequestBodyWrapper<ICreateCredentialsPayload | null>, 'request'>
    >
  >(CREATE_CREDENTIAL, requestWrapper);
}
export interface ICreateCredentialsPayload {
  CredentialName: string;
  KeyValueInfoList: Array<{
    Key: string;
    Value: string;
  }>;
  ProviderName: string;
}
