import auth from "@react-native-firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from '@react-navigation/stack';
import { inject, observer } from "mobx-react";
import * as React from "react";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Animated, Text, TouchableWithoutFeedback, View } from "react-native";
import { Button } from "react-native-elements";
import EStyleSheet from "react-native-extended-stylesheet";
import { TextInput } from "react-native-gesture-handler";
import Modal from "react-native-modal";
import Icon from "react-native-vector-icons/Ionicons";
import { Onboarding, Side } from "types";
import { BalanceHeader } from "../../components/balance-header";
import { Price } from "../../components/price";
import { Screen } from "../../components/screen";
import { translate } from "../../i18n";
import { DataStore } from "../../models/data-store";
import { color } from "../../theme";
import { palette } from "../../theme/palette";
import { AccountType } from "../../utils/enum";
import { AccountToAccountStore } from "../transaction-screen/transaction-screen";



export interface AccountDetailScreenProps {
  account: AccountType
  dataStore: DataStore
  navigation: StackNavigationProp<any,any>
}

const styles = EStyleSheet.create({
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

const BalanceHeaderDataInjection = inject("dataStore")(observer(
  ({ currency, dataStore, account }) => {
  return <BalanceHeader currency={currency} amount={dataStore.balances({ currency, account })} />
}))

const BuyAndSellComp = ({ dataStore, refresh }) => {
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


export const AccountDetailScreen: React.FC<AccountDetailScreenProps> = inject("dataStore")(
  observer(({ dataStore, route, navigation }) => {
    
    const account = route.params.account
    let accountStore = AccountToAccountStore({account, dataStore})

    React.useEffect(() => {
      navigation.setOptions({ title: account})
    }, [account])

    return (
      <Screen backgroundColor={palette.white} preset="scroll" style={{flex: 1}}>
        <BalanceHeaderDataInjection 
          currency={accountStore.currency}
          account={account}
        />
        <Price data={dataStore.rates.BTC} /> 
        {/* FIXME */}
        {//(account === AccountType.Bitcoin && !isAnonymous) && (
          // TODO integrate back BUY/SELL BTC, 
          //  but there is work to do on the backend first
          // <BuyAndSellComp
          //   dataStore={dataStore}
          //   refresh={refresh}
          // />)
         }
        {(account === AccountType.Bitcoin && !dataStore.onboarding.has(Onboarding.phoneVerification)) && (
          // TODO update when isAnonymous changes
          <Button title={"Activate Wallet"} 
            buttonStyle={{backgroundColor: palette.lightBlue, borderRadius: 32}} 
            style={{width: "50%", alignSelf: "center"}}
            onPress={() => navigation.navigate("phoneValidation")}
          />
        )}
        {account === AccountType.Bitcoin && (
          <>
            <View style={{flex: 1}} />
            <Button title={"Transactions History"} 
              type="clear"
              style={{width: "50%", alignSelf: "center"}}
              containerStyle={{paddingBottom: 24}}
              titleStyle={{color: palette.lightBlue}}
              onPress={() => navigation.navigate("transactionHistory", {account})}
            />
          </>
        )}
      </Screen>
    )
  }),
)
