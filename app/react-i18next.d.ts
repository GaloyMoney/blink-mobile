import "react-i18next";
import { TFuncKey } from "react-i18next";

import { resources } from "./i18n/i18n";

declare module "react-i18next" {
  interface CustomTypeOptions {
    defaultNS: "en";
    resources: typeof resources["en"];
  }
  type TranslationKeys = TFuncKey<"translation">;
}
