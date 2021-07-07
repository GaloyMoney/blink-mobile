import i18n from "i18n-js"

import * as en from "./en.json"
import * as es from "./es.json"

i18n.fallbacks = true
i18n.translations = { en, es }
