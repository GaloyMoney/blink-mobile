import functions from "@react-native-firebase/functions"
import { useNavigation } from "@react-navigation/native"
import { inject, observer } from "mobx-react"
import * as React from "react"
import { useEffect, useState } from "react"
import { ActivityIndicator, Alert, Animated, RefreshControl, SectionList, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native"
import { Button } from "react-native-elements"
import { TextInput, TouchableHighlight } from "react-native-gesture-handler"
import Modal from "react-native-modal"
import Icon from "react-native-vector-icons/Ionicons"
import { Onboarding, Side } from "types"
import { BalanceHeader } from "../../components/balance-header"
import { CurrencyText } from "../../components/currency-text"
import { Screen } from "../../components/screen"
import { SyncingComponent } from "../../components/syncing"
import { translate } from "../../i18n"
import { DataStore } from "../../models/data-store"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { sameDay, sameMonth } from "../../utils/date"
import { AccountType, CurrencyType, FirstChannelStatus } from "../../utils/enum"
import { shortenHash, showFundingTx } from "../../utils/helper"







export interface AccountDetailScreenProps {
  account: AccountType
  dataStore: DataStore
}

export interface AccountDetailItemProps {
  // TODO check validity of this interface
  name: string
  amount: number
  cashback?: number
  currency: CurrencyType
  date: Date
  addr?: string
  index: number
  icon: string
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: color.primary,
  },

  buttonContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },

  cashback: {
    fontSize: 12,
  },

  flex: {
    flex: 1,
  },

  fundingText: {
    color: color.primary,
    fontSize: 16,
    paddingVertical: 20,
    textAlign: "center",
    textDecorationLine: "underline",
  },

  headerSection: {
    backgroundColor: palette.white,
    color: color.text,
    fontSize: 18,
    padding: 22,
  },

  horizontal: {
    flexDirection: "row",
  },

  icon: {
    marginRight: 24,
    textAlign: "center",
    width: 32,
  },

  itemContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginHorizontal: 24,
    marginVertical: 12,
  },

  itemText: {
    color: color.text,
    fontSize: 18,
  },

  text: {
    color: palette.darkGrey,
    fontSize: 16,
    marginBottom: 10,
    marginHorizontal: 20,
    textAlign: "center",
  },

  vertical: {
    flexDirection: "column",
  },

  viewModal: {
    alignItems: "center",
    backgroundColor: palette.white,
    height: 250,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
  },
})

const AccountDetailItem: React.FC<AccountDetailItemProps> = (props) => {
  const { navigate } = useNavigation()

  return (
    <TouchableHighlight
      underlayColor="white"
      onPress={() =>
        navigate("transactionDetail", {
          name: props.name,
          amount: props.amount,
          cashback: props.cashback,
          currency: props.currency,
          date: props.date,
          id: props.id,
          preimage: props.preimage,
          account: props.account,
        })
      }
    >
      <View key={props.index} style={styles.itemContainer}>
        <Icon name={props.icon} style={styles.icon} color={color.primary} size={28} />
        <View style={styles.flex}>
          <Text style={styles.itemText}>{props.name}</Text>
          {(props.cashback != null && <Text style={styles.cashback}>{props.cashback} sats</Text>) ||
            (props.addr != null && <Text style={styles.cashback}>{props.addr}</Text>)}
        </View>
        <CurrencyText amount={props.amount} currency={props.currency} />
      </View>
    </TouchableHighlight>
  )
}

const VisualExpiration = ({ validUntil }) => {
  const [fadeAnim] = useState(new Animated.Value(0))

  React.useEffect(() => {
    fadeAnim.setValue(0)
    const duration = validUntil * 1000 - Date.now() // ms

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration, // ms
    }).start()
  }, [validUntil])

  return (
    <Animated.View
      style={{
        // ...style,
        width: fadeAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["100%", "0%"],
        }),
        height: 5,
        backgroundColor: fadeAnim.__getValue() === 0 ? color.primaryDarker : color.transparent,
      }}
    />
  )
}

const BalanceHeaderProxy = ({ currency, dataStore, account }) => {
  return <BalanceHeader currency={currency} amount={dataStore.balances({ currency, account })} />
}

const HeaderWithBuySell = ({ currency, account, dataStore, refresh }) => {
  const [side, setSide] = useState<Side>("buy")

  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState(1000)
  const [loadingQuote, setLoadingQuote] = useState(false)

  const { navigate } = useNavigation()

  const onModalHide = () => {
    dataStore.exchange.quote.reset()
  }

  const getQuote = async () => {
    try {
      setLoadingQuote(true)
      await dataStore.exchange.quoteLNDBTC({ side, satAmount: amount })
    } catch (err) {
      Alert.alert(err.toString())
    } finally {
      setLoadingQuote(false)
    }
  }

  const executeTrade = async () => {
    try {
      let fn
      if (side === "buy") {
        fn = ["buyLNDBTC"]
      } else if (side === "sell") {
        fn = ["sellLNDBTC"]
      }

      setLoading(true)

      const success = await dataStore.exchange[fn]()

      if (success) {
        refresh()
        if (side === "buy") {
          await dataStore.onboarding.add(Onboarding.buyFirstSats)
        }
        setMessage("Success!")
      } else {
        setMessage(translate("errors.generic"))
      }
    } catch (err) {
      setMessage(err.toString())
    }
  }

  const onBuyInit = () => {
    setSide("buy")
    setModalVisible(true)
  }

  const onSellInit = () => {
    setSide("sell")
    setModalVisible(true)
  }

  const [message, setMessage] = useState("")
  const [modalVisible, setModalVisible] = useState(false)

  // workaround of https://github.com/facebook/react-native/issues/10471
  useEffect(() => {
    if (message !== "") {
      setMessage("")
      Alert.alert(message, "", [
        {
          text: translate("common.ok"),
          onPress: () => {
            setModalVisible(false)
            setLoading(false)
          },
        },
      ])
    }
  }, [message])

  return (
    <>
      <Modal
        style={{ marginHorizontal: 0, marginBottom: 0 }}
        onModalHide={onModalHide}
        isVisible={modalVisible}
        swipeDirection={modalVisible ? ["down"] : ["up"]}
        onSwipeComplete={() => setModalVisible(false)}
        swipeThreshold={50}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.flex} />
        </TouchableWithoutFeedback>
        <View style={styles.viewModal}>
          <Icon
            name={"ios-remove"}
            size={64}
            color={palette.lightGrey}
            style={{ height: 34, top: -22 }}
          />
          {!dataStore.onboarding.has(Onboarding.bankOnboarded) && (
            <>
              <Text style={[styles.itemText, { marginVertical: 12 }]}>
                {translate("AccountDetailScreen.openAccount")}
              </Text>
              <Text style={[styles.itemText, { marginVertical: 12 }]}>
                {translate("AccountDetailScreen.openAccountReason", { side })}
              </Text>
              <Button
                title="Open account"
                onPress={() => {
                  setModalVisible(false)
                  navigate("openBankAccount")
                }}
                buttonStyle={styles.button}
                containerStyle={[styles.buttonContainer, { width: "100%" }]}
              />
            </>
          )}
          {dataStore.onboarding.has(Onboarding.bankOnboarded) && (
            <>
              <View style={{ flexDirection: "row", alignContent: "center" }}>
                <Text style={[styles.itemText, { paddingVertical: 12 }]}>
                  {translate("AccountDetailScreen.quote", { side })}
                </Text>
                <TextInput
                  value={amount.toString()}
                  onChangeText={(text) =>
                    setAmount(isNaN(Number.parseInt(text)) ? 0 : Number.parseInt(text))
                  }
                  style={styles.itemText}
                />
              </View>
              <Button
                title={`Get Quote`}
                onPress={getQuote}
                buttonStyle={styles.button}
                disabled={loadingQuote}
                containerStyle={[styles.buttonContainer, { width: "100%" }]}
              />
              {loadingQuote && (
                <ActivityIndicator size="small" color={color.primary} style={{ height: 46 }} />
              )}
              {!loadingQuote && (
                <Text style={[styles.itemText, { paddingVertical: 12 }]}>
                  {// TODO: make a component out of it
                  (!isNaN(dataStore.exchange.quote.satPrice) &&
                    `Price: USD ${(dataStore.exchange.quote.satPrice * 100000000).toFixed(2)}`) ||
                    " "}
                </Text>
              )}
              <View style={[styles.buttonContainer, { width: "100%" }]}>
                <VisualExpiration validUntil={dataStore.exchange.quote.validUntil} />
                <Button
                  title={`Validate Quote`}
                  onPress={executeTrade}
                  disabled={loading || isNaN(dataStore.exchange.quote.satPrice)}
                  loading={loading}
                  buttonStyle={styles.button}
                />
              </View>
            </>
          )}
        </View>
      </Modal>
      <BalanceHeaderProxy currency={currency} account={account} dataStore={dataStore} />
      <View style={styles.horizontal}>
        <Button
          title="Buy"
          buttonStyle={styles.button}
          containerStyle={styles.buttonContainer}
          onPress={onBuyInit}
        />
        <Button
          title="Sell"
          buttonStyle={styles.button}
          containerStyle={styles.buttonContainer}
          onPress={onSellInit}
        />
      </View>
    </>
  )
}

const formatTransactions = (transactions) => {
  const sections = []
  const today = []
  const yesterday = []
  const thisMonth = []
  const before = []

  transactions = transactions.slice().sort((a, b) => (a.date > b.date ? -1 : 1)) // warning without slice?

  const isToday = (tx) => {
    return sameDay(tx.date, new Date())
  }

  const isYesterday = (tx) => {
    return sameDay(tx.date, new Date().setDate(new Date().getDate() - 1))
  }

  const isThisMonth = (tx) => {
    return sameMonth(tx.date, new Date())
  }

  while (transactions.length) {
    // this could be optimized
    const tx = transactions.shift()
    if (isToday(tx)) {
      today.push(tx)
    } else if (isYesterday(tx)) {
      yesterday.push(tx)
    } else if (isThisMonth(tx)) {
      thisMonth.push(tx)
    } else {
      before.push(tx)
    }
  }

  if (today.length > 0) {
    sections.push({ title: translate("AccountDetailScreen.today"), data: today })
  }

  if (yesterday.length > 0) {
    sections.push({ title: translate("AccountDetailScreen.yesterday"), data: yesterday })
  }

  if (thisMonth.length > 0) {
    sections.push({ title: translate("AccountDetailScreen.thisMonth"), data: thisMonth })
  }

  if (before.length > 0) {
    sections.push({ title: translate("AccountDetailScreen.prevMonths"), data: before })
  }

  return sections
}

export const AccountDetailScreen: React.FC<AccountDetailScreenProps> = inject("dataStore")(
  observer(({ dataStore, route, navigation }) => {
    const account =
      route.params.account == AccountType.Bitcoin
        ? dataStore.lnd.statusFirstChannel === FirstChannelStatus.opened
          ? AccountType.Bitcoin
          : AccountType.VirtualBitcoin
        : route.params.account

    let accountStore

    React.useLayoutEffect(() => {
      navigation.setOptions({
        title: account,
      })
    }, [dataStore.lnd.statusFirstChannel])

    // should have a generic mapping here, could use mst for it?
    switch (account) {
      case AccountType.Bank:
        accountStore = dataStore.fiat
        break
      case AccountType.Bitcoin:
        accountStore = dataStore.lnd
        break
      case AccountType.VirtualBitcoin:
        accountStore = dataStore.onboarding
        break
    }

    const [refreshing, setRefreshing] = useState(false)

    const sections = formatTransactions(accountStore.transactions)
    const currency = accountStore.currency

    const refresh = async () => {
      await accountStore.update()

      if (account === AccountType.Bitcoin) {
        // FIXME
        await functions().httpsCallable("requestRewards")({})
      }
    }

    const onRefresh = React.useCallback(async () => {
      setRefreshing(true)
      refresh()
      setRefreshing(false)
    }, [refreshing])

    useEffect(() => {
      refresh()
    }, [])

    return (
      <Screen>
        {(account === AccountType.Bitcoin || account === AccountType.VirtualBitcoin) && (
          <HeaderWithBuySell
            currency={currency}
            account={account}
            dataStore={dataStore}
            refresh={refresh}
          />
        )}
        {account === AccountType.Bank && (
          <BalanceHeaderProxy currency={currency} account={account} dataStore={dataStore} />
        )}
        {sections.length === 0 && <Text>No transaction to show</Text>}
        {sections.length > 0 && (
          <SectionList
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            renderItem={({ item, index, section }) => (
              <AccountDetailItem account={account} currency={currency} {...item} />
            )}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={styles.headerSection}>{title}</Text>
            )}
            sections={sections}
            keyExtractor={(item, index) => item + index}
          />
        )}
        {(account == AccountType.VirtualBitcoin &&
          dataStore.lnd.statusFirstChannel == FirstChannelStatus.pending && (
            <View style={styles.sync}>
              <Text
                style={styles.fundingText}
                onPress={() => showFundingTx(dataStore.lnd.fundingTx)}
              >
                {translate(`common.fundingTx`, {
                  tx: shortenHash(dataStore.lnd.fundingTx),
                })}
              </Text>
            </View>
          )) ||
          (!dataStore.lnd.syncedToChain && <SyncingComponent />)}
      </Screen>
    )
  }),
)
