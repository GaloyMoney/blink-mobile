import type { FormattersInitializer } from "typesafe-i18n"
import type { Locales, Formatters } from "./i18n-types"

export const initFormatters: FormattersInitializer<Locales, Formatters> = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  locale: Locales,
) => {
  const formatters: Formatters = {
    sats: (value: unknown): unknown => {
      if (value === 0) {
        return `${value.toPrecision(1)} sat`
      }
      else if (value instanceof Number) {
        return `${value.toPrecision(1)} sats`
      } 
      return `${value} sats`
    },
  }
  return formatters
}
