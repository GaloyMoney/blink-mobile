import * as React from "react"
import { View, StyleSheet } from "react-native"
import { Text } from "../text"
import { color } from "../../theme"

import { inject, observer } from "mobx-react"
import { AccountType, CurrencyType } from "../../utils/enum"

import ContentLoader, { Rect } from "react-content-loader/native"
import { TextCurrency } from "../text-currency/text-currency"

const styles = StyleSheet.create({
  amount: {
    alignItems: "center",
    flexDirection: "column",
    height: 42, // FIXME should be dynamic?
  },

  balanceText: {
    color: color.primary,
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 20,
  },

  container: {
    flex: 1,
  },

  header: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 48,
  },
})

export interface BalanceHeaderProps {
  headingCurrency: CurrencyType
  accountsToAdd: AccountType
  dataStore?: any
  initialLoading: boolean
}

const Loader = () => (
  <ContentLoader height={50} width={120} speed={2} primaryColor="#f3f3f3" secondaryColor="#ecebeb">
    <Rect x="0" y="0" rx="4" ry="4" width="120" height="20" />
    <Rect x="30" y="35" rx="4" ry="4" width="60" height="10" />
  </ContentLoader>
)

export const BalanceHeader: React.FC<BalanceHeaderProps> = inject("dataStore")(
  observer(({ headingCurrency, dataStore, accountsToAdd, initialLoading }) => {
    const otherCurrency = headingCurrency === CurrencyType.BTC ? CurrencyType.USD : CurrencyType.BTC

    const subHeader = (
      <TextCurrency
        amount={dataStore.balances({
          currency: otherCurrency,
          account: accountsToAdd,
        })}
        currencyUsed={otherCurrency}
        fontSize={16}
      />
    )

    return (
      <View style={styles.header}>
        <View style={styles.amount}>
          <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
            {initialLoading && <Loader />}
            {!initialLoading && (
              <TextCurrency
                amount={dataStore.balances({
                  currency: headingCurrency,
                  account: accountsToAdd,
                })}
                currencyUsed={headingCurrency}
                fontSize={32}
              />
            )}
          </View>
          {!initialLoading && subHeader}
        </View>
        <Text style={styles.balanceText}>Current Balance</Text>
      </View>
    )
  }),
)
