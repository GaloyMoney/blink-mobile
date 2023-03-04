import { Translation } from "../i18n-types"
import en from '../en'
import rawSw from '../raw-i18n/translations/sw.json'
import merge from "lodash.merge"

const sw: Translation = merge({}, en as Translation, rawSw)

export default sw
