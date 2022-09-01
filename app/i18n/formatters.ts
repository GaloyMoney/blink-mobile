import type { FormattersInitializer } from "typesafe-i18n"
import type { Locales, Formatters } from "./i18n-types"

export const initFormatters: FormattersInitializer<Locales, Formatters> = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  locale: Locales,
) => {
  const formatters: Formatters = {
    sats: (value: number): string => {
      if (value === 0) {
        return `${value.toPrecision(1)} sat`
      }
      return `${value.toPrecision(1)} sats`
    },
  }
  return formatters
}
