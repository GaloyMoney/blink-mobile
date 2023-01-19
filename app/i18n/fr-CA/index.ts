// prettier-ignore

import { Translation } from "../i18n-types"
import en from '../en'
import rawFrCA from '../raw-i18n/translations/fr-CA.json'
import merge from "lodash.merge"

/* eslint-disable no-template-curly-in-string */
const frCA: Translation = merge({}, en as Translation, rawFrCA)

export default frCA
