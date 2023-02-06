// prettier-ignore

import { Translation } from "../i18n-types"
import en from '../en'
import rawTr from '../raw-i18n/translations/tr.json'
import merge from "lodash.merge"

/* eslint-disable no-template-curly-in-string */
const tr: Translation = merge({}, en as Translation, rawTr)

export default tr
