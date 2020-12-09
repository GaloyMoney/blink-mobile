import i18n from "i18n-js"

const en = require("./en")
const es = require("./es")

i18n.fallbacks = true
i18n.translations = { en, es }
