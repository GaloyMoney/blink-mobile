// prettier-ignore

import { Translation } from "../i18n-types"
import en from '../en'
import rawEs from '../raw-i18n/translations/es.json'
import { merge } from 'lodash'

/* eslint-disable no-template-curly-in-string */
/* eslint-disable max-lines */
const es: Translation = merge({}, en as Translation, rawEs)

export default es
