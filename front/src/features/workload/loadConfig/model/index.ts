import { reactive, ref } from 'vue';
import { useInputModel } from '@/shared/hooks/input/useInputModel.ts';
import {
  validateFunc,
  validateNumberFunc,
} from '@/features/workload/loadConfig/model/validate.ts';

export function useLoadConfigModel() {
  const protocol = reactive({
    menu: [
      { name: 'http', label: 'HTTP', type: 'item' },
      { name: 'https', label: 'HTTPS', type: 'item' },
    ],
    selected: 'http',
  });

  const methods = reactive({
    menu: [
      { name: 'get', label: 'GET', type: 'item' },
      { name: 'post', label: 'POST', type: 'item' },
      { name: 'put', label: 'PUT', type: 'item' },
      { name: 'delete', label: 'DELETE', type: 'item' },
    ],
    selected: 'get',
  });

  const location = reactive({
    values: [
      {
        key: 'remote',
        label: 'Remote',
      },
      {
        key: 'local',
        label: 'Local',
      },
    ],
    selected: 'remote',
  });

  const installed = reactive({
    menu: [
      { name: 'true', label: 'True', type: 'item' },
      { name: 'false', label: 'False', type: 'item' },
    ],
    selected: 'true',
  });

  const isMetrics = ref<boolean>(true);

  const inputModels = reactive({
    scenarioName: useInputModel<string>('', validateFunc),
    targetHostName: useInputModel<string>('', validateFunc),
    port: useInputModel<string>('80', e => validateNumberFunc(e, 65532)),
    path: useInputModel<string>('', validateFunc),
    bodyData: useInputModel<string>(''),
    virtualUsers: useInputModel<string>('', e => validateNumberFunc(e, 100)),
    testDuration: useInputModel<string>('', e => validateNumberFunc(e, 300)),
    rampUpTime: useInputModel<string>('', e => validateNumberFunc(e, 60)),
    rampUpSteps: useInputModel<string>('', e => validateNumberFunc(e, 20)),
    agentHostName: useInputModel<string>(''),
  });

  return {
    location,
    protocol,
    methods,
    isMetrics,
    inputModels,
    installed,
  };
}
