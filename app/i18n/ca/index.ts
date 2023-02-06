// prettier-ignore

import { Translation } from "../i18n-types"
import en from '../en'
import rawCa from '../raw-i18n/translations/ca.json'
import merge from "lodash.merge"

/* eslint-disable no-template-curly-in-string */
const ca: Translation = merge({}, en as Translation, rawCa)

export default ca
