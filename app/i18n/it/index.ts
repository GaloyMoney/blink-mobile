// prettier-ignore

import { Translation } from "../i18n-types"
import en from '../en'
import rawIt from '../raw-i18n/translations/vi.json'
import merge from "lodash.merge"

/* eslint-disable no-template-curly-in-string */
const it: Translation = merge({}, en as Translation, rawIt)

export default it
