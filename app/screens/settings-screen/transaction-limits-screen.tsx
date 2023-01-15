import React from "react"
import { ActivityIndicator, Button, View } from "react-native"
import { Text } from "@rneui/base"
import EStyleSheet from "react-native-extended-stylesheet"
import { LocalizedString } from "typesafe-i18n"

import { Screen } from "@app/components/screen"
import { useI18nContext } from "@app/i18n/i18n-react"
import { palette } from "@app/theme"
import { usdAmountDisplay } from "@app/utils/currencyConversion"
import { useAccountLimitsQuery } from "@app/graphql/generated"

const styles = EStyleSheet.create({
  container: {
    marginVertical: 0,
    borderTopWidth: 1,
    borderColor: palette.inputBackground,
    height: "100%",
  },
  limitWrapper: {
    padding: 20,
    backgroundColor: palette.white,
  },
  contentTextBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  valueFieldType: {
    fontWeight: "bold",
    fontSize: "15rem",
    paddingBottom: 8,
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
    borderColor: palette.inputBackground,
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
    fontSize: "18rem",
    marginBottom: 20,
  },
  loadingWrapper: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: "50%",
    marginBottom: "50%",
  },
})

const accountLimitsPeriodInHrs = {
  DAILY: "24",
  WEEKLY: "168",
} as const

export const TransactionLimitsScreen = () => {
  const { LL } = useI18nContext()
  const { data, loading, error, refetch } = useAccountLimitsQuery()

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
    <Screen style={styles.container}>
      <View style={styles.container}>
        <View style={styles.limitWrapper}>
          <Text adjustsFontSizeToFit style={styles.valueFieldType}>
            {LL.TransactionLimitsScreen.receive()}
          </Text>
          <View style={styles.content}>
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
          {data?.me?.defaultAccount.limits?.withdrawal.map((data, index: number) => {
            return <TransactionLimitsPeriod data={data} key={index} />
          })}
        </View>

        <View style={styles.divider}></View>

        <View style={styles.limitWrapper}>
          <Text adjustsFontSizeToFit style={styles.valueFieldType}>
            {LL.TransactionLimitsScreen.internalSend()}
          </Text>
          {data?.me?.defaultAccount.limits?.internalSend.map((data, index: number) => {
            return <TransactionLimitsPeriod data={data} key={index} />
          })}
        </View>

        <View style={styles.divider}></View>

        <View style={styles.limitWrapper}>
          <Text adjustsFontSizeToFit style={styles.valueFieldType}>
            {LL.TransactionLimitsScreen.stablesatTransfers()}
          </Text>
          {data?.me?.defaultAccount.limits?.convert.map((data, index: number) => {
            return <TransactionLimitsPeriod data={data} key={index} />
          })}
        </View>
      </View>
    </Screen>
  )
}

const TransactionLimitsPeriod = ({
  data,
}: {
  data: {
    readonly totalLimit: number
    readonly remainingLimit?: number | null
    readonly interval?: number | null
  }
}) => {
  const { LL } = useI18nContext()

  const convertCentToUSD = (centAmount: number) => {
    const usdAmount = centAmount / 100
    return usdAmountDisplay(usdAmount, 0)
  }

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

  return (
    <View style={styles.content}>
      <View style={styles.contentTextBox}>
        <Text adjustsFontSizeToFit style={styles.valueRemaining}>
          {typeof data.remainingLimit === "number"
            ? `${convertCentToUSD(
                data.remainingLimit,
              )} ${LL.TransactionLimitsScreen.remaining().toLocaleLowerCase()}`
            : ""}
        </Text>
        <Text adjustsFontSizeToFit style={styles.valueTotal}>
          {`${convertCentToUSD(data.totalLimit)} ${
            data.interval && getLimitDuration(data.interval)
          }`}
        </Text>
      </View>
    </View>
  )
}
