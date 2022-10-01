import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";

export const resources = {
  en: {
    en
  },
} as const;

// @ts-ignore
i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    lng: 'en',
    ns: ['en'],
    defaultNS:"en",
    resources,
  });

export { i18n as i18nInit };
