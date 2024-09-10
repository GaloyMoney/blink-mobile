import React from "react"
import { View } from "react-native"
import { makeStyles, Text } from "@rneui/themed"
import { LocalizedString } from "typesafe-i18n"

// hooks
import { useI18nContext } from "@app/i18n/i18n-react"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { usePriceConversion } from "@app/hooks"

// types
import { DisplayCurrency, toUsdMoneyAmount } from "@app/types/amounts"

const accountLimitsPeriodInHrs = {
  DAILY: "24",
  WEEKLY: "168",
} as const

const TransactionLimitsPeriod = ({
  totalLimit,
  remainingLimit,
  interval,
}: {
  readonly totalLimit: number
  readonly remainingLimit?: number | null
  readonly interval?: number | null
}) => {
  const { formatMoneyAmount } = useDisplayCurrency()
  const { convertMoneyAmount } = usePriceConversion()
  const { LL } = useI18nContext()
  const styles = useStyles()

  if (!convertMoneyAmount) {
    return null
  }

  const usdTotalLimitMoneyAmount = convertMoneyAmount(
    toUsdMoneyAmount(totalLimit),
    DisplayCurrency,
  )

  const usdRemainingLimitMoneyAmount =
    typeof remainingLimit === "number"
      ? convertMoneyAmount(toUsdMoneyAmount(remainingLimit), DisplayCurrency)
      : null

  const remainingLimitText = usdRemainingLimitMoneyAmount
    ? `${formatMoneyAmount({
        moneyAmount: usdRemainingLimitMoneyAmount,
      })} ${LL.TransactionLimitsScreen.remaining().toLocaleLowerCase()}`
    : ""

  const getLimitDuration = (period: number): LocalizedString | null => {
    const interval = (period / (60 * 60)).toString()
    switch (interval) {
      case accountLimitsPeriodInHrs.DAILY:
        return LL.TransactionLimitsScreen.perDay()
      case accountLimitsPeriodInHrs.WEEKLY:
        return LL.TransactionLimitsScreen.perWeek()
      default:
        return null
    }
  }

  const totalLimitText = `${formatMoneyAmount({
    moneyAmount: usdTotalLimitMoneyAmount,
  })} ${interval && getLimitDuration(interval)}`

  return (
    <View>
      <View style={styles.contentTextBox}>
        <Text adjustsFontSizeToFit style={styles.valueRemaining}>
          {remainingLimitText}
        </Text>
        <Text adjustsFontSizeToFit style={styles.valueTotal}>
          {totalLimitText}
        </Text>
      </View>
    </View>
  )
}

export default TransactionLimitsPeriod

const useStyles = makeStyles(({ colors }) => ({
  contentTextBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  valueRemaining: {
    fontWeight: "bold",
    color: colors.green,
    maxWidth: "50%",
  },
  valueTotal: {
    fontWeight: "bold",
    color: colors.grey3,
    maxWidth: "50%",
  },
}))
