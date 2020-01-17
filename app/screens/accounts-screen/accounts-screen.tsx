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
import { AccountType, CurrencyType } from "../../utils/enum"
import { palette } from "../../theme/palette"
import { useNavigation } from "react-navigation-hooks"
import auth from '@react-native-firebase/auth';
import { Notifications } from "react-native-notifications"

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
  ({ dataStore, account, icon, action }) => {

  const { navigate } = useNavigation()

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
        <Text style={styles.accountAmount}>
          {currency(dataStore.balances({ account, currency: CurrencyType.USD }), {
            formatWithSymbol: true,
          }).format()}
        </Text>
      </View>
    </TouchableHighlight>
  )
}))

export const AccountsScreen = inject("dataStore")(observer(
  ({ dataStore }) => {

  const [refreshing, setRefreshing] = useState(false);
  const { navigate } = useNavigation()

  //FIXME type any
  const accountTypes: Array<Record<string, any>> = [
    { key: "Checking", account: AccountType.Checking, icon: "ios-cash" },
    { key: "Bitcoin", account: AccountType.Bitcoin, icon: "logo-bitcoin" },
  ]

  // TODO right way to know if the user has an account
  const user = auth().currentUser;
  if (!user?.emailVerified) {
    accountTypes[0]['action'] = () => navigate('openBankAccount')
  }

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await dataStore.updateBalance()
    setRefreshing(false);
  }, [refreshing]);

  useEffect(() => {
    onRefresh()
  }, [])

  return (
    <Screen>
      <BalanceHeader headingCurrency={CurrencyType.BTC} accountsToAdd={AccountType.All} />
      <FlatList 
        data={accountTypes} 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => <AccountItem {...item} />} />
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
