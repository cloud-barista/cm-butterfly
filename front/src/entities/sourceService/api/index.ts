import { IAxiosResponse, useAxiosPost } from '@/shared/libs';
import { ISourceServiceResponse } from '@/entities/sourceService/model/types.ts';

const GET_SOURCE_SERVICE_LIST = 'GET_SOURCE_SERVICE_LIST';

export function useGetSourceServiceList() {
  return useAxiosPost<IAxiosResponse<ISourceServiceResponse>, null>(
    GET_SOURCE_SERVICE_LIST,
    null,
  );
}
