// prettier-ignore

import { Translation } from "../i18n-types"
import en from '../en'
import rawCs from '../raw-i18n/translations/cs.json'
import merge from "lodash.merge"

/* eslint-disable no-template-curly-in-string */
const cs: Translation = merge({}, en as Translation, rawCs)

export default cs
