import { Translation } from "../i18n-types"
import en from '../en'
import rawFr from '../raw-i18n/translations/fr.json'
import merge from "lodash.merge"


const frCA: Translation = merge({}, en as Translation, rawFr)

export default frCA
