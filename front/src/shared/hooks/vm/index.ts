import { IVm } from '@/entities/mci/model';
import { yellow } from '@/app/style/colors.ts';

export function getCloudProvidersInVms(vms: IVm[]) {
  const provider: { [key: string]: any } = {};

  vms.forEach(vm => {
    const { providerName } = vm.connectionConfig;
    if (providerName) {
      provider[providerName] ||= providerColor(providerName);
    }
  });

  return provider;
}

function providerColor(provider: string) {
  let color = '#EDEDEF';
  switch (provider) {
    case 'AWS':
      color = '#FF9900';
      break;
    case 'Google':
      color = '#4387F4';
      break;
    case 'Azure':
      color = '#00BCF0';
      break;
    case 'NHN':
      color = '#125DE6';
      break;
  }

  return color;
}
