import * as React from "react"
import { useState, useEffect } from "react"
import { observer, inject } from "mobx-react"
import { StyleSheet, View, RefreshControl } from "react-native"
import { Text } from "../../components/text"
import { Screen } from "../../components/screen"
import { FlatList } from "react-navigation"
import { color } from "../../theme/color"
import Icon from "react-native-vector-icons/Ionicons"
import currency from "currency.js"
import { BalanceHeader } from "../../components/balance-header"
import { AccountType, CurrencyType, PendingFirstChannelsStatus } from "../../utils/enum"
import { Onboarding } from "types"
import { palette } from "../../theme/palette"
import { useNavigation } from "react-navigation-hooks"

import ContentLoader, { Rect } from "react-content-loader/native"
import { ListItem } from "react-native-elements"

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
    borderColor: color.line,
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 15,
    marginHorizontal: 15,
    padding: 6,
  },

  icon: {
    width: 32,
    alignContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
  }
})

const AccountItem = inject("dataStore")(observer(
  ({ dataStore, account, icon, action, initialLoading, title }) => {

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
    <ListItem
      style={styles.accountView}
      chevron
      title={account}
      onPress={action || (() => navigate("accountDetail", { account }))}
      leftAvatar={<Icon name={icon} color={color.primary} size={28} style={styles.icon}/>}
      rightAvatar={
        <>
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
        </>
      }
    />
  )
}))


export const AccountsScreen = inject("dataStore")(observer(
  ({ dataStore }) => {

  const [ initialLoading, setInitialLoading] = useState(true)
  const [ refreshing, setRefreshing] = useState(false)
  const [ bitcoinType, setBitcoinType ] = useState(AccountType.Bitcoin)
  const { navigate } = useNavigation()

  //FIXME type any
  const accountTypes: Array<Record<string, any>> = [
    { key: "Bank Account", account: AccountType.Bank, icon: "ios-cash" },
    { key: "Bitcoin", account: bitcoinType, icon: "logo-bitcoin" },
  ]

  if (!dataStore.onboarding.has(Onboarding.bankOnboarded)) {
    accountTypes[0]['action'] = () => navigate('bankAccountRewards')
  }

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true)
    await dataStore.updateBalance()

    // TODO: refresh to update the wallet after
    // first channel is opened?
    const channelStatus = await dataStore.lnd.statusFirstChannelOpen()
    if ( channelStatus == PendingFirstChannelsStatus.opened) {
      setBitcoinType(AccountType.Bitcoin)
    } else {
      setBitcoinType(AccountType.VirtualBitcoin)
    }
    
    setRefreshing(false)
    setInitialLoading(false)
  }, [refreshing])

  useEffect(() => {
    onRefresh()
  }, [])

  return (
    <Screen>
      <BalanceHeader headingCurrency={CurrencyType.BTC} 
          accountsToAdd={dataStore.onboarding.has(Onboarding.channelCreated) ?
              AccountType.All : AccountType.AllVirtual
            }
          initialLoading={initialLoading} />
      <FlatList 
        data={accountTypes}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => <AccountItem {...item} initialLoading={initialLoading} />} />
      <View style={{flex: 1}}></View>
      <ListItem
      title={"Earn bitcoin rewards!"}
      style={[styles.accountView, {borderColor: color.primary}]}
      onPress={() => navigate("rewards")}
      leftAvatar={<Icon name="ios-gift" color={color.primary} size={28}  style={styles.icon} />}
      chevron
    />
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
