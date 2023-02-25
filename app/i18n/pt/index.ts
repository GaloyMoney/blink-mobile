// prettier-ignore

import { Translation } from "../i18n-types"
import en from '../en'
import rawtPt from '../raw-i18n/translations/pt.json'
import merge from "lodash.merge"

/* eslint-disable no-template-curly-in-string */
const ptBR: Translation = merge({}, en as Translation, rawtPt)

export default ptBR
