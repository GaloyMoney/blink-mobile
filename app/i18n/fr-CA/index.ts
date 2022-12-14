// prettier-ignore

import { Translation } from "../i18n-types"
import en from '../en'
import rawFrCA from '../raw-translations/fr-CA.json'
import { merge } from 'lodash'

/* eslint-disable no-template-curly-in-string */
/* eslint-disable max-lines */
const frCA: Translation = merge({}, en as Translation, rawFrCA)

export default frCA
