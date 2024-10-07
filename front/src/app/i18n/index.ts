import Vue from 'vue';
import type { IVueI18n } from 'vue-i18n';
import VueI18n from 'vue-i18n';

import en from './en.json';

Vue.use(VueI18n);

const supportLanguages = ['en'] as const;
type supportLanguage = (typeof supportLanguages)[number];

export const i18n = new VueI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en,
  },
  silentTranslationWarn: true,
  silentFallbackWarn: true,
});

export const setI18nLocale = async (_lang: string) => {
  let lang = _lang;
  if (!supportLanguages.includes(lang as supportLanguage)) {
    console.error(`Not supported language: ${lang} `);
    lang = 'en';
  }
  i18n.locale = lang as string;
};

/** ******************* */
/** Type Declaration * */
/** ****************** */
declare module 'vue/types/vue' {
  interface Vue {
    readonly $i18n: VueI18n & IVueI18n;
    $t: typeof VueI18n.prototype.t;
    $tc: typeof VueI18n.prototype.tc;
    $te: typeof VueI18n.prototype.te;
    $d: typeof VueI18n.prototype.d;
    $n: typeof VueI18n.prototype.n;
  }
}

declare module 'vue/types/options' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ComponentOptions<V extends Vue> {
    i18n?: {
      messages?: VueI18n.LocaleMessages;
      dateTimeFormats?: VueI18n.DateTimeFormats;
      numberFormats?: VueI18n.NumberFormats;
      sharedMessages?: VueI18n.LocaleMessages;
    };
  }
}
