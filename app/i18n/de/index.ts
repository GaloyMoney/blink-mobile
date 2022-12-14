// prettier-ignore

import { Translation } from "../i18n-types"
import en from '../en'
import rawDe from '../raw-translations/de.json'
import { merge } from 'lodash'

/* eslint-disable no-template-curly-in-string */
/* eslint-disable max-lines */
const de: Translation = merge({}, en as Translation, rawDe)

export default de
