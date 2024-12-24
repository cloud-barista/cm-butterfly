import {
  IAxiosResponse,
  RequestBodyWrapper,
  useAxiosPost,
} from '@/shared/libs';
import { IGetCredentialListResponse } from '@/entities/credentials/model/types.ts';

const GET_CREDENTIAL = 'List-Credential';
const CREATE_CREDENTIAL = 'Register-Credential';

export function useGetCredentialList() {
  return useAxiosPost<IAxiosResponse<IGetCredentialListResponse>, null>(
    GET_CREDENTIAL,
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
