import React from "react"
import { ActivityIndicator, Button, View } from "react-native"
import { Text } from "@rneui/base"
import { LocalizedString } from "typesafe-i18n"

import { Screen } from "@app/components/screen"
import { useI18nContext } from "@app/i18n/i18n-react"
import { palette } from "@app/theme"
import { useAccountLimitsQuery } from "@app/graphql/generated"
import { gql } from "@apollo/client"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { useAppConfig, usePriceConversion } from "@app/hooks"
import { DisplayCurrency, toUsdMoneyAmount } from "@app/types/amounts"
import { makeStyles } from "@rneui/themed"

const useStyles = makeStyles((theme) => ({
  limitWrapper: {
    padding: 20,
    backgroundColor: theme.colors.white,
  },
  contentTextBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  valueFieldType: {
    fontWeight: "bold",
    fontSize: 15,
    paddingBottom: 8,
    color: theme.colors.darkGreyOrWhite,
  },
  valueRemaining: {
    fontWeight: "bold",
    color: palette.green,
  },
  valueTotal: {
    fontWeight: "bold",
    color: palette.midGrey,
  },
  divider: {
    marginVertical: 0,
    borderWidth: 1,
    borderColor: theme.colors.grey10,
  },
  errorWrapper: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: "50%",
    marginBottom: "50%",
  },
  errorText: {
    color: palette.error,
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 20,
  },
  loadingWrapper: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: "50%",
    marginBottom: "50%",
  },
}))

const accountLimitsPeriodInHrs = {
  DAILY: "24",
  WEEKLY: "168",
} as const

gql`
  query accountLimits {
    me {
      id
      defaultAccount {
        id
        limits {
          withdrawal {
            totalLimit
            remainingLimit
            interval
          }
          internalSend {
            totalLimit
            remainingLimit
            interval
          }
          convert {
            totalLimit
            remainingLimit
            interval
          }
        }
      }
    }
  }
`

export const TransactionLimitsScreen = () => {
  const styles = useStyles()

  const { LL } = useI18nContext()
  const { data, loading, error, refetch } = useAccountLimitsQuery({
    fetchPolicy: "no-cache",
    skip: !useIsAuthed(),
  })

  const { appConfig } = useAppConfig()
  const { name: bankName } = appConfig.galoyInstance

  if (error) {
    return (
      <Screen>
        <View style={styles.errorWrapper}>
          <Text adjustsFontSizeToFit style={styles.errorText}>
            {LL.TransactionLimitsScreen.error()}
          </Text>
          <Button
            title="reload"
            disabled={loading}
            color={palette.error}
            onPress={() => refetch()}
          />
        </View>
      </Screen>
    )
  }

  if (loading) {
    return (
      <Screen>
        <View style={styles.loadingWrapper}>
          <ActivityIndicator animating size="large" color={palette.lightBlue} />
        </View>
      </Screen>
    )
  }

  return (
    <Screen preset="scroll">
      <View style={styles.limitWrapper}>
        <Text adjustsFontSizeToFit style={styles.valueFieldType}>
          {LL.TransactionLimitsScreen.receive()}
        </Text>
        <View>
          <View style={styles.contentTextBox}>
            <Text adjustsFontSizeToFit style={styles.valueRemaining}>
              {LL.TransactionLimitsScreen.unlimited()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.divider}></View>

      <View style={styles.limitWrapper}>
        <Text adjustsFontSizeToFit style={styles.valueFieldType}>
          {LL.TransactionLimitsScreen.withdraw()}
        </Text>
        {data?.me?.defaultAccount.limits?.withdrawal.map((data, index: number) => (
          <TransactionLimitsPeriod key={index} {...data} />
        ))}
      </View>

      <View style={styles.divider}></View>

      <View style={styles.limitWrapper}>
        <Text adjustsFontSizeToFit style={styles.valueFieldType}>
          {LL.TransactionLimitsScreen.internalSend({ bankName })}
        </Text>
        {data?.me?.defaultAccount.limits?.internalSend.map((data, index: number) => (
          <TransactionLimitsPeriod key={index} {...data} />
        ))}
      </View>

      <View style={styles.divider}></View>

      <View style={styles.limitWrapper}>
        <Text adjustsFontSizeToFit style={styles.valueFieldType}>
          {LL.TransactionLimitsScreen.stablesatTransfers()}
        </Text>
        {data?.me?.defaultAccount.limits?.convert.map((data, index: number) => (
          <TransactionLimitsPeriod key={index} {...data} />
        ))}
      </View>
    </Screen>
  )
}

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

  const usdRemainingLimitMoneyAmount = convertMoneyAmount(
    toUsdMoneyAmount(totalLimit),
    DisplayCurrency,
  )

  const remainingLimitText =
    typeof remainingLimit === "number"
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
