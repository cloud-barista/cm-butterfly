import {
  IAxiosResponse,
  RequestBodyWrapper,
  useAxiosPost,
} from '@/shared/libs';
import { IGetConnconfigListResponse } from '@/entities/credentials/model/types.ts';

const GET_CONNECTION = 'Getconnconfiglist';
const GET_CONNECTION_BYID = 'GetconnconfiglisGetconnconfig';

export function useGetConnconfigList() {
  return useAxiosPost<IAxiosResponse<IGetConnconfigListResponse>, null>(
    GET_CONNECTION,
    null,
  );
}
