import * as React from "react"
import { useEffect } from "react"
import { observer, inject } from "mobx-react"
import { StyleSheet, TouchableHighlight, View, Alert, Button } from "react-native"
import { Text } from "../../components/text"
import { Screen } from "../../components/screen"
import { FlatList, withNavigation } from "react-navigation"
import { color } from "../../theme/color"
import Icon from "react-native-vector-icons/Ionicons"
import currency from "currency.js"
import { BalanceHeader } from "../../components/balance-header"
import auth from "@react-native-firebase/auth"
import { AccountType, CurrencyType } from "../../utils/enum"

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

const AccountItem = withNavigation(
  inject("dataStore")(
    observer(({ dataStore, account, icon, navigation }) => {
      return (
        <TouchableHighlight
          underlayColor="white"
          onPress={() =>
            navigation.navigate("accountDetail", {
              account: account,
            })
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
    }),
  ),
)

export const AccountsScreen = withNavigation(
  inject("dataStore")(
    observer(({ dataStore, navigation }) => {
      const accountTypes: Array<Record<string, any>> = [
        //FIXME type any
        { key: "Checking", account: AccountType.Checking, icon: "ios-cash" },
        { key: "Bitcoin", account: AccountType.Bitcoin, icon: "logo-bitcoin" },
      ]

      dataStore.updateBalance()

      // TODO smart refresh --> listen to database and lnd log
      useEffect(() => {
        const timer = setInterval(dataStore.updateBalance, 10000)
        return () => clearTimeout(timer)
      }, [])

      const signOut = () => {
        auth()
          .signOut()
          .then(() => {
            navigation.navigate("authStack")
          })
          .catch(err => {
            console.tron.log(err)
            Alert.alert(err.code)
          })
      }

      return (
        <Screen>
          <BalanceHeader headingCurrency={CurrencyType.BTC} accountsToAdd={AccountType.All} />
          <FlatList data={accountTypes} renderItem={({ item }) => <AccountItem {...item} />} />
          <Button title="debugScreen" onPress={() => navigation.navigate("demo")}></Button>
          <Button title="Log out" onPress={() => signOut()}></Button>
        </Screen>
      )
    }),
  ),
)

AccountsScreen.navigationOptions = {
  title: "Accounts",
}
