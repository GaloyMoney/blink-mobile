import { Translation } from "../i18n-types"
import en from '../en'
import rawEs from '../raw-i18n/translations/es.json'
import merge from "lodash.merge"

const es: Translation = merge({}, en as Translation, rawEs)

export default es
