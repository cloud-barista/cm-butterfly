import { useAxiosPost } from '../../../shared/libs/api/request.ts';
import { IAxiosResponse, RequestBodyWrapper } from '../../../shared/libs';
import { IUserInfoResponse } from '../../index';

const LOGIN_URL = 'auth/login';
const GET_USER_INFO = 'Getuserinfo';
const GET_USER_LIST = 'GetUsers';
const ADD_USER = 'Createuser';
const DELETE_USER = 'DeleteUser';

export function useGetLogin<T, D>(loginData: D | null) {
  const requestBodyWrapper: Required<
    Pick<RequestBodyWrapper<D | null>, 'request'>
  > = {
    request: loginData,
  };
  return useAxiosPost<IAxiosResponse<T>, RequestBodyWrapper<D | null>>(
    LOGIN_URL,
    requestBodyWrapper,
  );
}

export function useGetUserRole<IUserResponse, D = any>() {
  return useAxiosPost<IUserResponse, D | null>(GET_USER_INFO, null);
}

export function getUserList() {
  return useAxiosPost<IAxiosResponse<IUserInfoResponse[]>, null>(
    GET_USER_LIST,
    null,
  );
}

export function useAddUser<T, D>(userData: D | null) {
  const requestBodyWrapper: Required<
    Pick<RequestBodyWrapper<D | null>, 'request'>
  > = {
    request: userData,
  };

  return useAxiosPost<IAxiosResponse<T>, RequestBodyWrapper<D | null>>(
    ADD_USER,
    requestBodyWrapper,
  );
}

export function useDeleteUser(userData: string | null) {
  const requestBodyWrapper: Required<
    Pick<RequestBodyWrapper<string | null>, 'request'>
  > = {
    request: userData,
  };

  return useAxiosPost<IAxiosResponse<any>, RequestBodyWrapper<string | null>>(
    DELETE_USER,
    requestBodyWrapper,
  );
}
