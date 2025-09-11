import {
  IAxiosResponse,
  RequestBodyWrapper,
  useAxiosPost,
} from '@/shared/libs';
import {
  IGetCredentialListResponse,
  ICreateCredentialsPayload,
} from '@/entities/credentials/model/types';

const GET_CREDENTIAL = 'List-Credential';
const CREATE_CREDENTIAL = 'Register-Credential';
const DELETE_CREDENTIAL = 'Unregister-Credential';

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

export function useDeleteCredentials(credentialName: string | null) {
  const requestWrapper: Required<
    Pick<RequestBodyWrapper<{ CredentialName: string | null }>, 'pathParams'>
  > = {
    pathParams: {
      CredentialName: credentialName,
    },
  };

  return useAxiosPost<
    IAxiosResponse<{ Result: string }>,
    Required<
      Pick<RequestBodyWrapper<{ CredentialName: string | null }>, 'pathParams'>
    >
  >(DELETE_CREDENTIAL, requestWrapper);
}
