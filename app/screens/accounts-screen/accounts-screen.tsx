import * as React from "react"
import { useState, useEffect } from "react"
import { observer, inject } from "mobx-react"
import { StyleSheet, TouchableHighlight, View, RefreshControl } from "react-native"
import { Text } from "../../components/text"
import { Screen } from "../../components/screen"
import { FlatList } from "react-navigation"
import { color } from "../../theme/color"
import Icon from "react-native-vector-icons/Ionicons"
import currency from "currency.js"
import { BalanceHeader } from "../../components/balance-header"
import { AccountType, CurrencyType, Onboarding } from "../../utils/enum"
import { palette } from "../../theme/palette"
import { useNavigation } from "react-navigation-hooks"

import ContentLoader, { Rect } from "react-content-loader/native"

const accountBasic = {
  color: color.text,
  fontSize: 18,
  paddingHorizontal: 12,
}

const styles = StyleSheet.create({
  accountAmount: {
    ...accountBasic,
  },

  accountTypeStyle: {
    ...accountBasic,
    flex: 1,
  },

  person: {
    paddingRight: 15
  },

  accountView: {
    alignItems: "center",
    borderColor: color.line,
    borderRadius: 4,

    borderWidth: 0.5,
    flexDirection: "row",
    margin: 8,
    padding: 16,
  },
})

const AccountItem = inject("dataStore")(observer(
  ({ dataStore, account, icon, action, initialLoading }) => {

  const { navigate } = useNavigation()

  const Loader = () => (
    <ContentLoader 
      height={20}
      width={70}
      speed={2}
      primaryColor="#f3f3f3"
      secondaryColor="#ecebeb"
    >
      <Rect x="0" y="0" rx="4" ry="4" width="60" height="20" /> 
    </ContentLoader>
  )

  return (
    <TouchableHighlight
      underlayColor="white"
      onPress={
        action || (() => navigate("accountDetail", { account }))
      }
    >
      <View style={styles.accountView}>
        <Icon name={icon} color={color.primary} size={28} />
        <Text style={styles.accountTypeStyle}>{account}</Text>
        { initialLoading &&
          <Loader />
        }
        { !initialLoading &&
          <Text style={styles.accountAmount}>
            {currency(dataStore.balances({ account, currency: CurrencyType.USD }), {
              formatWithSymbol: true,
            }).format()}
          </Text>
        }
          
      </View>
    </TouchableHighlight>
  )
}))


export const AccountsScreen = inject("dataStore")(observer(
  ({ dataStore }) => {

  const [ initialLoading, setInitialLoading] = useState(true);
  const [ refreshing, setRefreshing] = useState(false);
  const { navigate } = useNavigation()

  //FIXME type any
  const accountTypes: Array<Record<string, any>> = [
    { key: "Checking", account: AccountType.Checking, icon: "ios-cash" },
    { key: "Bitcoin", account: AccountType.Bitcoin, icon: "logo-bitcoin" },
  ]

  if (dataStore.onboarding.stage == Onboarding.walletOnboarded) {
    accountTypes[0]['action'] = () => navigate('openBankAccount')
  }

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true)
    await dataStore.updateBalance()
    setRefreshing(false)
    setInitialLoading(false)
  }, [refreshing])

  useEffect(() => {
    onRefresh()
  }, [])

  return (
    <Screen>
      <BalanceHeader headingCurrency={CurrencyType.BTC} 
          accountsToAdd={AccountType.All}
          initialLoading={initialLoading} />
      <FlatList 
        data={accountTypes} 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => <AccountItem {...item} initialLoading={initialLoading} />} />
    </Screen>
  )
}))

AccountsScreen.navigationOptions = screenProps => ({
  title: "Accounts",
  headerRight: () => <Icon name={"ios-person"} 
      size={32}
      color={palette.darkGrey} 
      style={styles.person}
      onPress={() => screenProps.navigation.navigate("demo")}
    />
})
