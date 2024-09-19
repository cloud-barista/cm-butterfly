import { i18n } from '../../../app/i18n';

export const PROVIDER_ID_LIST = Object.freeze({
  ncp: `${i18n.t('CLOUD_RESOURCES.PROVIDER.NCP')}`,
  ncpvpc: `${i18n.t('CLOUD_RESOURCES.PROVIDER.NCPVPC')}`,
  openstack: `${i18n.t('CLOUD_RESOURCES.PROVIDER.OPEN_STACK')}`,
  ktcloud: `${i18n.t('CLOUD_RESOURCES.PROVIDER.KT_CLOUD')}`,
  ktcloudvpc: `${i18n.t('CLOUD_RESOURCES.PROVIDER.KT_CLOUD_VPC')}`,
  alibaba: `${i18n.t('CLOUD_RESOURCES.PROVIDER.ALIBABA')}`,
  ibm: `${i18n.t('CLOUD_RESOURCES.PROVIDER.IBM')}`,
  gcp: `${i18n.t('CLOUD_RESOURCES.PROVIDER.GCP')}`,
  azure: `${i18n.t('CLOUD_RESOURCES.PROVIDER.AZURE')}`,
  nhncloud: `${i18n.t('CLOUD_RESOURCES.PROVIDER.NHN_CLOUD')}`,
  aws: `${i18n.t('CLOUD_RESOURCES.PROVIDER.AWS')}`,
  tencent: `${i18n.t('CLOUD_RESOURCES.PROVIDER.TENCENT')}`,
});
