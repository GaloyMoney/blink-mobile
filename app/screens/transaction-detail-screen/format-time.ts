import { TranslationFunctions } from "@app/i18n/i18n-types"

export const formatTimeToMempool = (
  timeDiff: number,
  LL: TranslationFunctions,
  userLocale: string,
) => {
  const rtf = new Intl.RelativeTimeFormat(userLocale, { numeric: "auto" })

  const minutes = Math.floor(timeDiff / 60000)
  const seconds = Math.floor((timeDiff % 60000) / 1000)

  if (minutes > 0) {
    return rtf.format(minutes, "minute")
  } else if (seconds > 0) {
    return rtf.format(seconds, "second")
  }
  return LL.TransactionDetailScreen.momentarily()
}

export const timeToMempool = (arrivalTimestamp: number) => {
  const arrivalTime = new Date(arrivalTimestamp * 1000)
  const currentTime = new Date()

  let timeDiff = Number(arrivalTime) - Number(currentTime)
  timeDiff = Math.max(timeDiff, 0)

  return timeDiff
}
