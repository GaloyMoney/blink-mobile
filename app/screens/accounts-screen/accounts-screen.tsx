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
import { useQuery, StoreContext } from "../../models"
import { palette } from "../../theme/palette"
import { AccountType, CurrencyType } from "../../utils/enum"
import { Token } from "../../utils/token"
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
  ({ account, amount, navigation, loading, title, action=undefined, subtitle=true }) => {

  return (
    <LargeButton
      title={title}
      onPress={action || (() => navigation.navigate("accountDetail", { account }))}
      icon={account === AccountType.Bank &&
            <MoneyCircle width={75} height={78} />
        ||  <BitcoinCircle width={75} height={78} />
      }
      loading={loading}
      subtitle={subtitle ? 
        currency(amount, { formatWithSymbol: true }).format() :
        null
      }
    />
  )
}

// const gql_query = `
// query home($isLogged: Boolean!) {
//   prices {
//     __typename
//     id
//     o
//   }
//   earnList {
//     __typename
//     id
//     value
//     completed @include(if: $isLogged)
//   }
//   wallet @include(if: $isLogged) {
//     __typename
//     id
//     balance
//     currency
//   }
//   me @include(if: $isLogged) {
//     __typename
//     id
//     level
//   }
// }
// `

const gql_query_logged = `
query gql_query_logged {
  prices {
    __typename
    id
    o
  }
  earnList {
    __typename
    id
    value
    completed
  }
  wallet {
    __typename
    id
    balance
    currency
  }
  me {
    __typename
    id
    level
  }
}
`

const gql_query_anonymous = `
query gql_query_anonymous {
  prices {
    __typename
    id
    o
  }
  earnList {
    __typename
    id
    value
  }
}
`

export const AccountsScreen = observer(({ route, navigation }) => {

  const getQuery = () => new Token().has() ? gql_query_logged : gql_query_anonymous

  const store = React.useContext(StoreContext)
  let query, error, loading, setQuery

  try {    
    ({query, error, loading, setQuery} = useQuery(getQuery()))
  } catch (err) {
    console.tron.log({err})
  }

  const refreshQuery = async () => {
    console.tron.log("refresh query")
    setQuery(getQuery())
    await query.refetch()
  }

  // FIXME type any
  const accountTypes: Array<Record<string, any>> = [
    { key: "Cash Account", 
      account: AccountType.Bank, 
      // title: AccountType.Bank, 
      action: () => navigation.navigate("bankAccountEarn"),
      title: "Open Cash Account",
      subtitle: false
    },
    { key: "Bitcoin", account: AccountType.Bitcoin, title: AccountType.Bitcoin, loading},
  ]

  accountTypes.forEach(item => item.amount = store.balances(
    {currency: "USD", account: item.account}
  ))

  // TODO refactor ==> bank should also have a virtual screen
  if (!loading && (store.user.level) >= 2) {
    //TODO
  }

  // if (data.me.level < 1) {
  //   accountTypes[1].subtitle = false
  // }

  return (
    <Screen backgroundColor={palette.lighterGrey}>
      <BalanceHeader
        loading={loading}
        currency={CurrencyType.USD}
        amount={store.balances({currency: "USD", account: AccountType.BankAndBitcoin})}
        amountOtherCurrency={store.balances({
          currency: CurrencyType.BTC,
          account: AccountType.BankAndBitcoin,
        })}
      />
      <FlatList
        data={accountTypes}
        extraData={store.accountRefresh}
        style={styles.listContainer}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => refreshQuery()} />}
        renderItem={({ item }) => (
          <AccountItem
            {...item}
            navigation={navigation}
          />
        )}
      />
      {error && <Text style={{color: palette.red, alignSelf: "center"}}>
        {error.message}
      </Text>}
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
