import * as React from "react"
import { useState, useEffect } from "react"
import { observer, inject } from "mobx-react"
import { StyleSheet, View, RefreshControl, FlatList } from "react-native"
import { Text } from "../../components/text"
import { Screen } from "../../components/screen"
import { color } from "../../theme/color"
import Icon from "react-native-vector-icons/Ionicons"
import currency from "currency.js"
import { BalanceHeader } from "../../components/balance-header"
import { AccountType, CurrencyType, FirstChannelStatus } from "../../utils/enum"
import { Onboarding } from "types"
import { useNavigation } from '@react-navigation/native';

import ContentLoader, { Rect } from "react-content-loader/native"
import { translate } from "../../i18n"
import { Overlay } from "../../components/overlay"

import functions from "@react-native-firebase/functions"
import { ListItem } from "react-native-elements"
import { palette } from "../../theme/palette"


const accountBasic = {
  color: color.text,
  fontSize: 18,
}

const styles = StyleSheet.create({
  accountAmount: {
    ...accountBasic,
  },

  accountTypeStyle: {
    ...accountBasic,
    paddingHorizontal: 12,
    flex: 1,
  },

  accountView: {
    marginBottom: 15,
    marginHorizontal: 15,
  },

  accountViewContainer: {
    borderRadius: 8,
    backgroundColor: color.backgroundLighter,
  },

  accountViewTitle: {
    color: 'white',
    fontWeight: 'bold'
  },

  icon: {
    width: 72,
    alignContent: "center",
    alignSelf: "center",
    alignItems: "center",
  },
})

export const AccountItem = 
  ({ account, icon, action, initialLoading, balance, navigate }) => {

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
      containerStyle={styles.accountViewContainer}
      titleStyle={styles.accountViewTitle}
      chevron
      title={account}
      onPress={action || (() => navigate("accountDetail", { account }))}
      leftAvatar={<Icon name={icon} color={color.primary} size={64} style={styles.icon} />}
      subtitle={
        <>
          {initialLoading && <Loader />}
          {!initialLoading && (
            <Text style={styles.accountAmount}>
              {currency(balance, {formatWithSymbol: true}).format()}
            </Text>
          )}
        </>
      }
    />
  )
}

export const AccountsScreen = inject("dataStore")(
  observer(({ dataStore }) => {
    const [initialLoading, setInitialLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const { navigate } = useNavigation()

    //FIXME type any
    const accountTypes: Array<Record<string, any>> = [
      { key: "Bank Account", account: AccountType.Bank, icon: "ios-cash" },
      { key: "Bitcoin", account: AccountType.Bitcoin, icon: "logo-bitcoin" }
    ]

    // TODO refactor ==> bank should also have a virtual screen
    if (!dataStore.onboarding.has(Onboarding.bankOnboarded)) {
      accountTypes[0]["action"] = () => navigate("bankAccountRewards")
    }

    const onRefresh = React.useCallback(async () => {
      setRefreshing(true)

      if (dataStore.lnd.statusFirstChannel === FirstChannelStatus.opened) {
        // FIXME quick fix for now, work on state management so this is not necessary
        // one case: if the app went on sleep and the function is not triggered
        await functions().httpsCallable("requestRewards")({}) 
      }

      await dataStore.updateBalance()

      setRefreshing(false)
      setInitialLoading(false)
    }, [refreshing])

    useEffect(() => {
      onRefresh()
    }, [])

    return (
      <Screen>
        {dataStore.onboarding.stage.length === 1 && <Overlay screen="accounts" />}
        <BalanceHeader
          headingCurrency={CurrencyType.USD}
          accountsToAdd={
            dataStore.lnd.statusFirstChannel == FirstChannelStatus.opened
              ? AccountType.BankAndVirtualBitcoin
              : AccountType.BankAndBitcoin
          }
          initialLoading={initialLoading}
        />
        <FlatList
          data={accountTypes}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => <AccountItem 
            {...item} 
            initialLoading={initialLoading}
            balance={dataStore.balances({ item: item.account, currency: CurrencyType.USD })}
            navigate={navigate}
            />}
        />
        <View style={{ flex: 1 }}></View>
        <ListItem
          title={translate("AccountsScreen.bitcoinRewards")}
          style={styles.accountView}
          titleStyle={{color: palette.white}}
          containerStyle={{ backgroundColor: color.background }}
          onPress={() => navigate("rewards")}
          leftAvatar={<Icon name="ios-gift" color={palette.white} size={28} style={styles.icon} />}
        />
      </Screen>
    )
  }),
)