import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Ref, ref } from 'vue';
import { axiosInstance } from '@/shared/libs/api/instance';
import {
  AsyncStatus,
  extractErrorMessage,
  IUseBulkAxiosWrapperReturnType,
  IUseAxiosErrorDetail,
} from '@/shared/libs/api/index';

export function axiosBulkPost<T, D extends Array<unknown> = any>(
  url: string,
  data: D,
  config?: AxiosRequestConfig,
) {
  const promiseArr = data.map(datum =>
    axiosInstance.post<T>(`/${url}`, datum, config),
  );
  return axios.all(promiseArr);
}

function useAxiosWrapper<T, D extends Array<unknown> = any>(
  apiCall: (
    payload?: D,
    config?: AxiosRequestConfig,
  ) => Promise<AxiosResponse<T>[]>,
): IUseBulkAxiosWrapperReturnType<T, D> | IUseAxiosErrorDetail {
  const isLoading: Ref<boolean> = ref(false);
  const data: Ref<T[] | null> = ref(null);
  const error: Ref<Error | null> = ref(null);
  const errorMsg: Ref<string[] | null> = ref(null);
  const status: Ref<AsyncStatus> = ref<AsyncStatus>('idle');

  const execute = async (
    payload?: D,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>[]> => {
    isLoading.value = true;
    status.value = 'loading';
    let result;
    try {
      result = await apiCall(payload, config);
      reset();
      data.value = result.map(res => res.data);
      status.value = 'success';
      return Promise.resolve(result);
    } catch (e: any) {
      reset();
      error.value = e;
      errorMsg.value = e.map((e: any) => extractErrorMessage(e));
      status.value = 'error';
      return Promise.reject({ error, errorMsg, status });
    } finally {
      isLoading.value = false;
    }
  };

  const reset = () => {
    isLoading.value = false;
    status.value = 'idle';
    data.value = null;
    error.value = null;
    errorMsg.value = null;
  };

  return {
    isLoading,
    data,
    error,
    errorMsg,
    status,
    reset,
    execute,
  };
}

export function useAxiosBulkPost<T extends Array<T>, D extends Array<unknown>>(
  url: string,
  data: D,
  initialConfig: AxiosRequestConfig = {},
) {
  return useAxiosWrapper<T[], D>((payload, dynamicConfig) => {
    const mergedConfig = {
      ...initialConfig,
      ...dynamicConfig,
    };
    return axiosBulkPost<T, D>(url, payload || data, mergedConfig);
  });
}
