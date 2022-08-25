import type { FormattersInitializer } from "typesafe-i18n"
import type { Locales, Formatters } from "./i18n-types"
import { number } from "typesafe-i18n/formatters"
import { detectLocale } from "./i18n-util"

export const initFormatters: FormattersInitializer<Locales, Formatters> = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  locale: Locales,
) => {
  const formatters: Formatters = {
    sats: (value: number): string => {
      if (value > 0) {
        return `${value.toPrecision(0)} sat`
      }
      return `${value.toPrecision(0)} sats`
    },
  }
  return formatters
}
