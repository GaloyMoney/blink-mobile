import { Translation } from "../i18n-types"
import en from '../en'
import rawIt from '../raw-i18n/translations/it.json'
import merge from "lodash.merge"


const it: Translation = merge({}, en as Translation, rawIt)

export default it
