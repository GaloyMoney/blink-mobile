import merge from "lodash.merge"

import en from "../en"
import { Translation } from "../i18n-types"
import rawTranslated from "../raw-i18n/translations/sk.json"

const translated: Translation = merge({}, en as Translation, rawTranslated)

export default translated
