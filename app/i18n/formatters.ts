import type { FormattersInitializer } from "typesafe-i18n"
import type { Locales, Formatters } from "./i18n-types"

export const initFormatters: FormattersInitializer<Locales, Formatters> = (
  _locale: Locales,
) => {
  const formatters: Formatters = {
    sats: (value: unknown): unknown => {
      if (!value) return "0 sats"

      const amount = Number(value)
      if (isNaN(amount)) return "0 sats"
      if (amount === 1) return "1 sat"

      return `${amount} sats`
    },
  }
  return formatters
}
