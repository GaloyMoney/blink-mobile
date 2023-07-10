import React from "react"
import { Text } from "react-native"
import { useI18nContext } from "@app/i18n/i18n-react"
import { TxStatus } from "@app/graphql/generated"

type TransactionDateProps = {
  createdAt: number
  status: TxStatus
  diffDate?: boolean
}

export const outputRelativeDate = (createdAt: number, locale: string) => {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })

  const durationInSeconds = Math.max(
    0,
    Math.floor((Date.now() - createdAt * 1000) / 1000),
  )
  let duration = ""
  if (durationInSeconds < 60) {
    duration = rtf.format(-durationInSeconds, "second")
  } else if (durationInSeconds < 3600) {
    duration = rtf.format(-Math.floor(durationInSeconds / 60), "minute")
  } else if (durationInSeconds < 86400) {
    duration = rtf.format(-Math.floor(durationInSeconds / 3600), "hour")
  } else if (durationInSeconds < 2592000) {
    // 30 days
    duration = rtf.format(-Math.floor(durationInSeconds / 86400), "day")
  } else if (durationInSeconds < 31536000) {
    // 365 days
    duration = rtf.format(-Math.floor(durationInSeconds / 2592000), "month")
  } else {
    duration = rtf.format(-Math.floor(durationInSeconds / 31536000), "year")
  }

  return duration
}

export const TransactionDate = ({
  createdAt,
  status,
  diffDate = false,
}: TransactionDateProps) => {
  const { LL, locale } = useI18nContext()
  if (status === "PENDING") {
    return <Text>{LL.common.pending().toUpperCase()}</Text>
  }
  if (diffDate) {
    return <Text>{outputRelativeDate(createdAt, locale)}</Text>
  }
  return (
    <Text>
      {new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(new Date(createdAt * 1000))}
    </Text>
  )
}
