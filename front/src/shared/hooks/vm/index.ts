import { IVm } from '@/entities/mci/model';

export function getCloudProvidersInVms(vms: IVm[]) {
  const provider: { [key: string]: any } = {};

  vms.forEach(vm => {
    const { providerName } = vm.connectionConfig;
    if (providerName) {
      provider[providerName] ||= providerColor(providerName);
    }
  });

  return Object.values(provider);
}

function providerColor(provider: string) {
  const upperCaseProvider = provider.toUpperCase();

  let color = '#EDEDEF';
  switch (upperCaseProvider) {
    case 'AWS':
      color = '#FF9900';
      break;
    case 'GOOGLE':
      color = '#4387F4';
      break;
    case 'AZURE':
      color = '#00BCF0';
      break;
    case 'NHN':
      color = '#125DE6';
      break;
  }

  return {
    name: provider,
    color: color,
  };
}
