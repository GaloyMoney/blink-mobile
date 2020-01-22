import * as React from "react"
import { useState, useEffect } from "react"
import { observer, inject } from "mobx-react"

import { View, SectionList, StyleSheet, RefreshControl, TouchableWithoutFeedback, Alert } from "react-native"

import Modal from "react-native-modal";

import { Text } from "../../components/text"
import { Screen } from "../../components/screen"
import { color } from "../../theme"
import Icon from "react-native-vector-icons/Ionicons"

import { BalanceHeader } from "../../components/balance-header"
import { DataStore } from "../../models/data-store"
import { sameDay, sameMonth } from "../../utils/date"
import { CurrencyText } from "../../components/currency-text"
import { TouchableHighlight } from "react-native-gesture-handler"
import { AccountType, CurrencyType, Onboarding } from "../../utils/enum"
import { useNavigation, useNavigationParam } from "react-navigation-hooks"
import { Button } from "react-native-elements"
import { palette } from "../../theme/palette";
import { Side } from "../../../../common/type"
import { Loader } from "../../components/loader";

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
    margin: 0,
    height: 200,
    backgroundColor: palette.white,
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


const updateTransactions = async (accountStore) => {
  await accountStore.update()

  let transactions = accountStore.transactions
  
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

    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [sections, setSections] = useState([]);
    const [side, setSide] = useState<Side>("buy");
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
  

    const { navigate } = useNavigation()

    const account = useNavigationParam("account")

    const accountStore = account === AccountType.Checking ?
        dataStore.fiat
      : dataStore.lnd

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
        await dataStore.exchange.quoteLNDBTC(side)
      } catch (err) {
        Alert.alert(err.toString())
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
      setSections(await updateTransactions(accountStore))
    }

    const onRefresh = React.useCallback(async () => {
      setRefreshing(true)
      refresh()
      setRefreshing(false)
    }, [refreshing]);

    useEffect(() => {
      refresh()
    }, [])

    return (
      <Screen>
        <Modal 
          onModalHide={onModalHide}
          isVisible={modalVisible} 
          swipeDirection={modalVisible ? ['down'] : ['up']}
          onSwipeComplete={() => setModalVisible(false)}
          swipeThreshold={50}
          >
          <Loader loading={loading} />
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.flex} />
          </TouchableWithoutFeedback>
          { dataStore.onboarding.stage === Onboarding.walletOnboarded &&
            <View style={styles.viewModal}>
              <Text style={styles.itemText}>Open a Galoy bank account</Text>
              <Text style={styles.itemText}>To {side} bitcoin you will need a Galoy bank account,
              so you can transfer US dollar</Text>
              <Button title="Open account" 
                onPress={() => {setModalVisible(false); navigate('bankRewards')}}  
              />
            </View>
          }
          { dataStore.onboarding.stage === Onboarding.bankOnboarded &&
            <View style={styles.viewModal}>
              <Text style={styles.itemText}>Get Quote to {side} 1000 sats</Text>
              <Button title={`Get Quote`} onPress={getQuote} />
              <Text>Side: {dataStore.exchange.quote.side}</Text>
              <Text>SatPrice: {dataStore.exchange.quote.satPrice}</Text>
              <Text>Valid until: {dataStore.exchange.quote.validUntil}</Text>
              <Text>Sat amount: {dataStore.exchange.quote.satAmount}</Text>
              <Button title={`Validate Quote`} onPress={executeTrade} 
                disabled={isNaN(dataStore.exchange.quote.satPrice)}/>
            </View>
          }
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
    )
}))

AccountDetailScreen.navigationOptions = screenProps => ({
  title: screenProps.navigation.getParam("account")
})
