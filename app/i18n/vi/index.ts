import { Translation } from "../i18n-types"
import en from '../en'
import rawVi from '../raw-i18n/translations/vi.json'
import merge from "lodash.merge"

const vi: Translation = merge({}, en as Translation, rawVi)

export default vi
