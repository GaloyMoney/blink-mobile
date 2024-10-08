import { Translation } from "../i18n-types"
import en from '../en'
import rawTranslated from '../raw-i18n/translations/ro.json'
import merge from "lodash.merge"

const translated: Translation = merge({}, en as Translation, rawTranslated)

export default translated
