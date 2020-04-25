import currency from "currency.js"
import { inject, observer } from "mobx-react"
import * as React from "react"
import { useEffect, useState } from "react"
import ContentLoader, { Rect } from "react-content-loader/native"
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native"
import { Button, ListItem } from "react-native-elements"
import Icon from "react-native-vector-icons/Ionicons"
import { Onboarding } from "types"
import { BalanceHeader } from "../../components/balance-header"
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { color } from "../../theme/color"
import { palette } from "../../theme/palette"
import { AccountType, CurrencyType } from "../../utils/enum"
import MoneyCircle from "./money-circle-02.svg"
import BitcoinCircle from "./bitcoin-circle-01.svg"
import EStyleSheet from "react-native-extended-stylesheet"
import { LargeButton } from "../../components/large-button"


const styles = EStyleSheet.create({
  accountView: {
    marginBottom: "15rem",
    marginHorizontal: "30rem",
  },

  icon: {
    width: 48
  }
})

export const AccountItem = 
  ({ account, amount, navigation, title, action=undefined, subtitle=true }) => {
  const initialLoading = isNaN(amount)

  console.tron.log({subtitle, account})

  return (
    <LargeButton
      title={title}
      onPress={action || (() => navigation.navigate("accountDetail", { account }))}
      icon={account === AccountType.Bank &&
            <MoneyCircle width={75} height={78} />
        ||  <BitcoinCircle width={75} height={78} />
      }
      loading={initialLoading}
      subtitle={subtitle ? 
        currency(amount, { formatWithSymbol: true }).format() :
        null
      }
    />
  )
}

export const AccountsScreen = inject("dataStore")(
  observer(({ dataStore, route, navigation }) => {
    const [refreshing, setRefreshing] = useState(false)

    console.tron.log({forceRefresh: route.params?.forceRefresh})

    useEffect(() => {
      if (route.params?.forceRefresh === true) {
        navigation.setOptions({ forceRefresh: false })
        onRefresh()
      }
    }, [route.params?.forceRefresh]);

    // FIXME type any
    const accountTypes: Array<Record<string, any>> = [
      { key: "Cash Account", account: AccountType.Bank, title: AccountType.Bank },
      { key: "Bitcoin", account: AccountType.Bitcoin, title: AccountType.Bitcoin },
    ]

    // TODO refactor ==> bank should also have a virtual screen
    if (!dataStore.onboarding.has(Onboarding.bankOnboarded)) {
      accountTypes[0].action = () => navigation.navigate("bankAccountRewards")
      accountTypes[0].title = "Open Cash Account"
      accountTypes[0].subtitle = false
    }

    if (!dataStore.onboarding.has(Onboarding.walletActivated)) {
      accountTypes[1].subtitle = false
    }

    const accountToAdd = AccountType.BankAndBitcoin

    const onRefresh = React.useCallback(async () => {
      setRefreshing(true)

      await dataStore.updateBalance()

      setRefreshing(false)
    }, [refreshing])

    useEffect(() => {
      onRefresh()
    }, [])
    return (
      <Screen style={{backgroundColor: palette.lighterGrey}}>
        {/* {dataStore.onboarding.stage.length === 1 && <Overlay screen="accounts" />} */}
        <BalanceHeader
          currency={CurrencyType.USD}
          amount={dataStore.balances({ currency: CurrencyType.USD, account: accountToAdd })}
          amountOtherCurrency={dataStore.balances({
            currency: CurrencyType.BTC,
            account: accountToAdd,
          })}
        />
        <FlatList
          data={accountTypes}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <AccountItem
              {...item}
              amount={dataStore.balances({ currency: CurrencyType.USD, account: item.account })}
              navigation={navigation}
            />
          )}
        />
        <View style={{ flex: 1 }}></View>
        <Button
          title={translate("AccountsScreen.bitcoinRewards")}
          style={styles.accountView}
          titleStyle={{ color: palette.blue }}
          type="clear"
          // containerStyle={{ backgroundColor: color.primary }}
          onPress={() => navigation.navigate("Rewards")}
          icon={<Icon name="ios-gift" color={palette.lightBlue} size={28} style={styles.icon} />}
        />
      </Screen>
    )
  }),
)
