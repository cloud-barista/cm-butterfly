import { reactive, ref } from 'vue';
import { useInputModel } from '@/shared/hooks/input/useInputModel.ts';

export function useLoadConfigModel() {
  const protocol = reactive({
    menu: [
      { name: 'HTTP', label: 'HTTP', type: 'item' },
      { name: 'HTTPS', label: 'HTTPS', type: 'item' },
    ],
  });

  const methods = reactive({
    menu: [
      { name: 'GET', label: 'GET', type: 'item' },
      { name: 'POST', label: 'POST', type: 'item' },
      { name: 'PUT', label: 'PUT', type: 'item' },
      { name: 'DELETE', label: 'DELETE', type: 'item' },
    ],
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
    selected: ['remote'],
  });

  const installed = reactive({
    menu: [
      { name: 'true', label: 'True', type: 'item' },
      { name: 'false', label: 'False', type: 'item' },
    ],
  });

  const isMetrics = ref<boolean>(true);

  const inputModels = reactive({
    scenarioName: useInputModel<string>(''),
    hostName: useInputModel<string>(''),
    port: useInputModel<string>(''),
    path: useInputModel<string>(''),
    bodyData: useInputModel<string>(''),
    virtualUsers: useInputModel<string>(''),
    testDuration: useInputModel<string>(''),
    rampUpTime: useInputModel<string>(''),
    rampUpSteps: useInputModel<string>(''),
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
