import * as React from "react"
import { useState, useEffect } from "react"
import { observer, inject } from "mobx-react"

import { View, SectionList, StyleSheet, RefreshControl, TouchableWithoutFeedback, Alert, Easing, Animated, ActivityIndicator } from "react-native"

import Modal from "react-native-modal";

import { Text } from "../../components/text"
import { Screen } from "../../components/screen"
import { color } from "../../theme"
import Icon from "react-native-vector-icons/Ionicons"

import { BalanceHeader } from "../../components/balance-header"
import { DataStore } from "../../models/data-store"
import { sameDay, sameMonth } from "../../utils/date"
import { CurrencyText } from "../../components/currency-text"
import { TouchableHighlight, TextInput } from "react-native-gesture-handler"
import { AccountType, CurrencyType } from "../../utils/enum"
import { useNavigation, useNavigationParam } from "react-navigation-hooks"
import { Button } from "react-native-elements"
import { palette } from "../../theme/palette"
import { Side, Onboarding } from "types"

export interface AccountDetailScreenProps {
  account: AccountType
  dataStore: DataStore
}

export interface AccountDetailItemProps {
  // TODO check validity of this interface
  name: string,
  amount: number,
  cashback?: number,
  currency: CurrencyType,
  date: Date,
  addr?: string,
  index: number,
  icon: string
}

const styles = StyleSheet.create({
  cashback: {
    fontSize: 12,
  },

  flex: {
    flex: 1,
  },

  headerSection: {
    color: color.text,
    margin: 22,
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

  vertical: {
    flexDirection: "column",
  },

  horizontal: {
    flexDirection: "row",
  },

  button: {
    backgroundColor: color.primary
  },

  buttonContainer: {
    paddingHorizontal: 15,
    flex: 1
  },

  viewModal: {
    justifyContent: 'flex-end',
    padding: 20,
    height: 240,
    backgroundColor: palette.white,
    alignItems: "center",
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

const VisualExpiration = ({validUntil}) => {
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
          outputRange: ['100%', '0%'],
        }),
        height: 5,
        backgroundColor: fadeAnim.__getValue() === 0 ? color.primaryDarker : color.transparent,
      }}
    />
  );
}


const formatFiatTransactions = (transactions) => {
  
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

  while(transactions.length) { // this could be optimized
    let tx = transactions.shift()
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
    sections.push({ title: "Today", data: today })
  }

  if (yesterday.length > 0) {
    sections.push({ title: "Yesterday", data: yesterday })
  }

  if (thisMonth.length > 0) {
    sections.push({ title: "This month", data: thisMonth })
  }

  if (before.length > 0) {
    sections.push({ title: "Previous months", data: before })
  }

  return sections
}

export const AccountDetailScreen: React.FC<AccountDetailScreenProps>
  = inject("dataStore")(
    observer(({ dataStore }) => {

    const account = useNavigationParam("account")

    const accountStore = account === AccountType.Bank ?
      dataStore.fiat
    : dataStore.lnd

    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [sections, setSections] = useState(formatFiatTransactions(accountStore.transactions));
  
    const [side, setSide] = useState<Side>("buy");
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [amount, setAmount] = useState(1000)
    const [loadingQuote, setLoadingQuote] = useState(false)
  

    const { navigate } = useNavigation()

    const currency = accountStore.currency


    // trading 

    const onBuyInit = () => {
      setSide("buy")
      setModalVisible(true)
    }

    const onSellInit = () => {
      setSide("sell")
      setModalVisible(true)
    }

    const onModalHide = () => {
      dataStore.exchange.quote.reset()
    }

    const getQuote = async () => {
      try {
        setLoadingQuote(true)
        await dataStore.exchange.quoteLNDBTC({side, satAmount: amount})
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
          setMessage("Success!")
        } else {
          setMessage("There was an error. Please try again later")
        }
      } catch (err) {
        setMessage(err.toString())
      }
    }

    // workaround of https://github.com/facebook/react-native/issues/10471
    useEffect(() => {
      if (message !== "") {
        setMessage("")
        Alert.alert(message, "", [
          {
            text: "OK",
            onPress: () => {
              setModalVisible(false)
              setLoading(false)
            },
          },
        ])
      }
    }, [message])


    const refresh = async () => {
      await accountStore.update()
      setSections(formatFiatTransactions(accountStore.transactions))
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
        <Modal 
          style={{marginHorizontal: 0, marginBottom: 0}}
          onModalHide={onModalHide}
          isVisible={modalVisible} 
          swipeDirection={modalVisible ? ['down'] : ['up']}
          onSwipeComplete={() => setModalVisible(false)}
          swipeThreshold={50}
          >
            <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
              <View style={styles.flex} />
            </TouchableWithoutFeedback>
            <View style={styles.viewModal}>
            { !dataStore.onboarding.has(Onboarding.bankOnboarded) &&
                <>
                  <Text style={[styles.itemText, {marginVertical: 12}]}>Open a Galoy bank account</Text>
                  <Text style={[styles.itemText, {marginVertical: 12}]}>To {side} bitcoin you will need a Galoy bank account,
                  so you can transfer US Dollar</Text>
                  <Button title="Open account" 
                    onPress={() => {setModalVisible(false); navigate('openBankAccount')}}  
                    buttonStyle={styles.button}
                    containerStyle={[styles.buttonContainer, {width: "100%"}]}
                  />
                </>
            }
            { dataStore.onboarding.has(Onboarding.bankOnboarded) &&
              <>
                <View style={{flexDirection: "row", alignContent: "center"}}>
                  <Text style={[styles.itemText, {paddingVertical: 12}]}>How many sats to {side}:{" "}</Text>
                  <TextInput value={amount.toString()} onChangeText={text => 
                      setAmount(isNaN(Number.parseInt(text)) ? 0 : Number.parseInt(text) )
                    } 
                        style={styles.itemText} />
                </View>
                <Button title={`Get Quote`} onPress={getQuote} 
                        buttonStyle={styles.button}
                        disabled={loadingQuote}
                        containerStyle={[styles.buttonContainer, {width: "100%"}]}
                  />
                  { loadingQuote && <ActivityIndicator size="small" color={color.primary} style={{height: 46}} />}
                  { !loadingQuote &&
                    <Text style={[styles.itemText, {paddingVertical: 12}]}>
                      {
                        !isNaN(dataStore.exchange.quote.satPrice) &&
                        `Price: USD ${(dataStore.exchange.quote.satPrice * 100000000).toFixed(2)}`
                        || " "
                      } 
                    </Text>
                  }
                <View style={[styles.buttonContainer, {width: "100%"}]}>
                  <VisualExpiration validUntil={dataStore.exchange.quote.validUntil} />
                  <Button title={`Validate Quote`} onPress={executeTrade} 
                    disabled={loading || isNaN(dataStore.exchange.quote.satPrice)}
                    loading={loading}
                    buttonStyle={styles.button}
                    />  
                </View>
              </>
            }
            </View>
          </Modal>
        <BalanceHeader headingCurrency={currency} accountsToAdd={account} />
        { account == AccountType.Bitcoin && 
          <View style={styles.horizontal}>
            <Button title="Buy" 
              buttonStyle={styles.button}
              containerStyle={styles.buttonContainer}
              onPress={onBuyInit}  
              />
            <Button title="Sell"
              buttonStyle={styles.button}
              containerStyle={styles.buttonContainer}
              onPress={onSellInit}  
              />  
          </View>
        }
        { sections.length === 0 && 
          <Text>No transaction to show</Text>
        }
        { sections.length > 0 && 
          <SectionList
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item, index, section }) => (
              <AccountDetailItem account={account} currency={currency} {...item} />
            )}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={styles.headerSection}>{title}</Text>
            )}
            sections={sections}
            keyExtractor={(item, index) => item + index}
        />
        }
      </Screen>
)}))

AccountDetailScreen.navigationOptions = screenProps => ({
  title: screenProps.navigation.getParam("account")
})
