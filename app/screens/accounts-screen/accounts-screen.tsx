import currency from "currency.js"
import { observer } from "mobx-react"
import * as React from "react"
import { FlatList, RefreshControl, Text, View } from "react-native"
import { Button } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import Icon from "react-native-vector-icons/Ionicons"
import { BalanceHeader } from "../../components/balance-header"
import { LargeButton } from "../../components/large-button"
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { useQuery } from "../../models"
import { palette } from "../../theme/palette"
import { AccountType, CurrencyType } from "../../utils/enum"
import BitcoinCircle from "./bitcoin-circle-01.svg"
import MoneyCircle from "./money-circle-02.svg"


const styles = EStyleSheet.create({
  accountView: {
    marginBottom: "15rem",
    marginHorizontal: "30rem",
  },

  icon: {
    width: 48
  },

  listContainer: {
    marginTop: "32rem"
  }
})

export const AccountItem = 
  ({ account, amount, navigation, title, action=undefined, subtitle=true }) => {
  const initialLoading = isNaN(amount)

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

const gql_query = `
query home {
  prices {
    __typename
    id
    o
  }
  wallet(uid: "1234") {
    __typename
    id
    balance
    currency
  }
  me(uid: "1234") {
    __typename
    id
    level
  }
}
`

export const AccountsScreen = observer(({ route, navigation }) => {
  const { store, error, loading, data } = useQuery(gql_query)

  // console.tron.log({forceRefresh: route.params?.forceRefresh})

  // useEffect(() => {
  //   if (route.params?.forceRefresh === true) {
  //     navigation.setOptions({ forceRefresh: false })
  //     onRefresh()
  //   }
  // }, [route.params?.forceRefresh]);

  if (loading) {
    return <Text>Loading</Text>
  }

  if (error) {
    return <Text>{"\n\n"}{error.message}</Text>
  }

  // FIXME type any
  const accountTypes: Array<Record<string, any>> = [
    { key: "Cash Account", account: AccountType.Bank, title: AccountType.Bank},
    { key: "Bitcoin", account: AccountType.Bitcoin, title: AccountType.Bitcoin},
  ]

  accountTypes.forEach(item => item.amount = store.balances(
    {currency: "USD", account: item.account}
  ))

  // TODO refactor ==> bank should also have a virtual screen
  if (data.me.level < 2) {
    accountTypes[0].action = () => navigation.navigate("bankAccountEarn")
    accountTypes[0].title = "Open Cash Account"
    accountTypes[0].subtitle = false
  }

  // if (data.me.level < 1) {
  //   accountTypes[1].subtitle = false
  // }

  // const onRefresh = React.useCallback(async () => {
  //   setRefreshing(true)

  //   await dataStore.updateBalance()

  //   setRefreshing(false)
  // }, [refreshing])

  // useEffect(() => {
  //   onRefresh()

  //   // FIXME this should live outside of a component
  //   dataStore.rates.update()
  // }, [])

  return (
    <Screen backgroundColor={palette.lighterGrey}>
      <BalanceHeader
        currency={CurrencyType.USD}
        amount={store.balances({currency: "USD", account: AccountType.BankAndBitcoin})}
        amountOtherCurrency={store.balances({
          currency: CurrencyType.BTC,
          account: AccountType.BankAndBitcoin,
        })}
      />
      <FlatList
        data={accountTypes}
        style={styles.listContainer}
        // refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        refreshControl={<RefreshControl refreshing={loading} />}
        renderItem={({ item }) => (
          <AccountItem
            {...item}
            navigation={navigation}
          />
        )}
      />
      <View style={{ flex: 1 }}></View>
      <Button
        title={translate("AccountsScreen.bitcoinEarn")}
        style={styles.accountView}
        titleStyle={{ color: palette.blue }}
        type="clear"
        // containerStyle={{ backgroundColor: color.primary }}
        onPress={() => navigation.navigate("Earn")}
        icon={<Icon name="ios-gift" color={palette.lightBlue} size={28} style={styles.icon} />}
      />
    </Screen>
  )
})
