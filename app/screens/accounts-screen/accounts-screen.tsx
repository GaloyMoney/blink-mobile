import functions from "@react-native-firebase/functions"
import { useNavigation } from "@react-navigation/native"
import currency from "currency.js"
import { inject, observer } from "mobx-react"
import * as React from "react"
import { useEffect, useState } from "react"
import ContentLoader, { Rect } from "react-content-loader/native"
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native"
import { ListItem, Button } from "react-native-elements"
import Icon from "react-native-vector-icons/Ionicons"
import { Onboarding } from "types"
import { BalanceHeader } from "../../components/balance-header"
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { color } from "../../theme/color"
import { palette } from "../../theme/palette"
import { AccountType, CurrencyType, FirstChannelStatus } from "../../utils/enum"



const accountBasic = {
  color: color.text,
  fontSize: 18,
}

const styles = StyleSheet.create({
  accountAmount: {
    ...accountBasic,
    color: color.primaryDarker
  },

  accountTypeStyle: {
    ...accountBasic,
    flex: 1,
    paddingHorizontal: 12,
  },

  accountView: {
    marginBottom: 15,
    marginHorizontal: 30,
  },

  accountViewContainer: {
    backgroundColor: palette.white,
    borderRadius: 8,
  },

  accountViewTitle: {
    color: palette.darkGrey,
    fontWeight: "bold",
  },

  icon: {
    alignContent: "center",
    alignItems: "center",
    alignSelf: "center",
    width: 72,
  },
})

export const AccountItem = ({ account, icon, amount, navigate, title=undefined, action=undefined}) => {
  const initialLoading = isNaN(amount)

  const Loader = () => (
    <ContentLoader height={20} width={70} speed={2} primaryColor="#f3f3f3" secondaryColor="#ecebeb">
      <Rect x="0" y="0" rx="4" ry="4" width="60" height="20" />
    </ContentLoader>
  )

  return (
    <ListItem
      style={styles.accountView}
      containerStyle={styles.accountViewContainer}
      titleStyle={styles.accountViewTitle}
      chevron
      title={title ?? account}
      onPress={action || (() => navigate("accountDetail", { account }))}
      leftAvatar={<Icon name={icon} color={color.primary} size={64} style={styles.icon} />}
      subtitle={!title &&
        <>
          {initialLoading && <Loader />}
          {!initialLoading && (
            <Text style={styles.accountAmount}>
              {currency(amount, { formatWithSymbol: true }).format()}
            </Text>
          )}
        </>
      }
    />
  )
}

export const AccountsScreen = inject("dataStore")(
  observer(({ dataStore }) => {
    const [refreshing, setRefreshing] = useState(false)
    const { navigate } = useNavigation()

    // FIXME type any
    const accountTypes: Array<Record<string, any>> = [
      { key: "Cash Account", account: AccountType.Bank, icon: "ios-cash" },
      { key: "Bitcoin", account: AccountType.Bitcoin, icon: "logo-bitcoin" },
    ]

    // TODO refactor ==> bank should also have a virtual screen
    if (!dataStore.onboarding.has(Onboarding.bankOnboarded)) {
      accountTypes[0].action = () => navigate("bankAccountRewards")
      accountTypes[0].title = "Open Cash Account"
    }

    // FIXME
    if (dataStore.lnd.statusFirstChannel !== FirstChannelStatus.opened) {
      accountTypes[1].account = AccountType.VirtualBitcoin
    }

    const accountToAdd =
      dataStore.lnd.statusFirstChannel == FirstChannelStatus.opened
        ? AccountType.BankAndVirtualBitcoin
        : AccountType.BankAndBitcoin

    const onRefresh = React.useCallback(async () => {
      setRefreshing(true)

      if (dataStore.lnd.statusFirstChannel === FirstChannelStatus.opened) {
        // FIXME quick fix for now, work on state management so this is not necessary
        // one case: if the app went on sleep and the function is not triggered
        await functions().httpsCallable("requestRewards")({})
      }

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
              navigate={navigate}
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
          onPress={() => navigate("rewards")}
          icon={<Icon name="ios-gift" color={palette.blue} size={28} style={styles.icon} />}
        />
      </Screen>
    )
  }),
)
