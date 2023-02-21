// prettier-ignore

import { Translation } from "../i18n-types"
import en from '../en'
import rawVi from '../raw-i18n/translations/vi.json'
import merge from "lodash.merge"

/* eslint-disable no-template-curly-in-string */
const vi: Translation = merge({}, en as Translation, rawVi)

export default vi
