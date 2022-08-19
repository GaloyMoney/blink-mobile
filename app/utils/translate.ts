import i18n from "i18n-js"

import { LANG_EN_US, LANG_ES_SV, LANG_PT_BR, LANG_FR_CA } from "@galoymoney/client"

i18n.fallbacks = true
i18n.translations = { en: LANG_EN_US, es: LANG_ES_SV, pt: LANG_PT_BR, fr: LANG_FR_CA }

export type GaloyTranslateUnknown = (
  scope: string,
  options?: i18n.TranslateOptions | undefined,
) => string

export const translate: GaloyTranslateUnknown = (scope, options) => {
  const translation = i18n.t(scope, { defaultValue: scope, ...options })
  return translation
}

export const setLocale = (language: string | undefined): void => {
  if (language && language !== "DEFAULT" && i18n.locale !== language) {
    i18n.locale = language
  }
}

export const getLocale = (): string => {
  return i18n.locale
}
