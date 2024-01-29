import React from "react"
import { Text } from "react-native"

import { TxStatus } from "@app/graphql/generated"
import { useI18nContext } from "@app/i18n/i18n-react"

type TransactionDateProps = {
  createdAt: number
  includeTime: boolean
  status: TxStatus
}

export const formatDateForTransaction = ({
  createdAt,
  locale,
  timezone,
  now = Date.now(),
  includeTime,
}: {
  createdAt: number
  locale: string
  timezone?: string
  now?: number
  includeTime: boolean
}) => {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })

  const diffInSeconds = Math.max(0, Math.floor((now - createdAt * 1000) / 1000))
  let output = ""

  // if date is less than 1 day, we calculate relative time
  // otherwise, we return absolute date and time
  if (diffInSeconds < 60) {
    output = rtf.format(-diffInSeconds, "second")
  } else if (diffInSeconds < 3600) {
    output = rtf.format(-Math.floor(diffInSeconds / 60), "minute")
  } else if (diffInSeconds < 86400) {
    output = rtf.format(-Math.floor(diffInSeconds / 3600), "hour")
  } else {
    const options: Intl.DateTimeFormatOptions = {
      dateStyle: "full",
    }
    // forcing a timezone for the tests
    if (timezone) {
      options.timeZone = timezone
    }
    if (includeTime) {
      options.timeStyle = "medium"
    }

    output = new Date(createdAt * 1000).toLocaleString(locale, options)
  }

  return output
}

export const TransactionDate = ({
  createdAt,
  status,
  includeTime,
}: TransactionDateProps) => {
  const { LL, locale } = useI18nContext()
  if (status === "PENDING") {
    return <Text>{LL.common.pending().toUpperCase()}</Text>
  }
  return <Text>{formatDateForTransaction({ createdAt, locale, includeTime })}</Text>
}
