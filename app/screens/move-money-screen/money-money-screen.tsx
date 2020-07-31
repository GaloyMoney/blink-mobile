import { observer } from "mobx-react"
import * as React from "react"
import { useState } from "react"
import { FlatList, RefreshControl, ScrollView, Text, View } from "react-native"
import { Button } from "react-native-elements"
import EStyleSheet from 'react-native-extended-stylesheet'
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import Modal from "react-native-modal"
import Icon from "react-native-vector-icons/Ionicons"
import { BalanceHeader } from "../../components/balance-header"
import { IconTransaction } from "../../components/icon-transactions"
import { LargeButton } from "../../components/large-button"
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { StoreContext, useQuery } from "../../models"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { AccountType, CurrencyType } from "../../utils/enum"
import { Token } from "../../utils/token"


const styles = EStyleSheet.create({
  screenStyle: {
    backgroundColor: palette.lighterGrey
  },

  buttonStyle: {
    borderColor: color.primary,
    borderRadius: 32,
    borderWidth: 2,
  },

  titleStyle: {
    color: color.primary,
    fontWeight: "bold",
    fontSize: "18rem",
  },

  listItem: {
    marginVertical: "8rem",
    marginHorizontal: "12rem",
    borderRadius: 8,
  },


  buttonContainerStyle: {
    marginTop: "16rem",
    width: "80%",
  },

  flex: {
    flex: 1,
  },

  icon: {
    marginRight: "12rem",
    textAlign: "center",
    width: 32,
  },

  text: {
    color: palette.darkGrey,
    fontSize: "20rem",
    // fontWeight: "bold",
  },

  viewModal: {
    alignItems: "center",
    backgroundColor: palette.white,
    height: "25%",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
  },

  lightningText: {
    textAlign: "center",
    fontSize: "16rem",
  },

  listContainer: {
    marginTop: "32rem"
  }
})


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

export const MoveMoneyScreenDataInjected = observer(
  ({ navigation }) => {

    const getQuery = () => new Token().has() ? gql_query_logged : gql_query_anonymous

    const store = React.useContext(StoreContext)
    let query, error, loading, setQuery
  
    try {    
      ({query, error, loading, setQuery} = useQuery(getQuery()))
    } catch (err) {
      // TODO manage error properly. "Unhandled promise rejection"
      // when no network is available
      console.tron.log({err})
    }
  
    const refreshQuery = async () => {
      console.tron.log("refresh query")
      setQuery(getQuery())
      await query.refetch()
    }

    const walletActivated = store.user.level > 0

    return <MoveMoneyScreen 
      navigation={navigation}
      walletActivated={walletActivated}
      loading={loading}
      error={error}
      store={store}
      refreshQuery={refreshQuery}
    />
})

export const MoveMoneyScreen = (
  ({ walletActivated, navigation, loading, error, store, refreshQuery }) => {

  const [modalVisible, setModalVisible] = useState(false)

  const [secretMenuCounter, setSecretMenuCounter] = useState(0)
  React.useEffect(() => {
    if (secretMenuCounter > 2) {
      navigation.navigate("Profile")
      setSecretMenuCounter(0)
    }
  }, [secretMenuCounter])

  const onBitcoinClick = (target) => {
    walletActivated ? navigation.navigate(target) : setModalVisible(true)
  }

  const activateWallet = () => {
    setModalVisible(false)
    navigation.navigate("phoneValidation")
  }

  console.tron.log({accountRefresh: store.accountRefresh})

  return (
    <Screen style={styles.screenStyle}>
      <Modal
        style={{ marginHorizontal: 0, marginBottom: 0 }}
        isVisible={modalVisible}
        swipeDirection={modalVisible ? ["down"] : ["up"]}
        onSwipeComplete={() => setModalVisible(false)}
        swipeThreshold={50}
      >
        <View style={styles.flex}>
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={{width: "100%", height: "100%"}} />
          </TouchableWithoutFeedback>
        </View>
        <View style={styles.viewModal}>
          <Icon
            name={"ios-remove"}
            size={64}
            color={palette.lightGrey}
            style={{ height: 34, top: -22 }}
          />
          <Text style={styles.text}>{translate("MoveMoneyScreen.needWallet")}</Text>
          <Button
            title={translate("MoveMoneyScreen.openWallet")}
            onPress={activateWallet}
            type="outline"
            buttonStyle={styles.buttonStyle}
            titleStyle={styles.titleStyle}
            containerStyle={styles.buttonContainerStyle}
          />
          <View style={{flex: 1}} />
        </View>
      </Modal>
        <BalanceHeader
          loading={loading}
          currency={CurrencyType.USD}
          amount={store.balances({currency: "USD", account: AccountType.BankAndBitcoin})}
          amountOtherCurrency={store.balances({
            currency: CurrencyType.BTC,
            account: AccountType.BankAndBitcoin,
          })}
        />
        {/* FIXME remove relative */}
        <View style={{position: "relative", alignItems: "flex-end", right: 64, bottom: 64}}> 
          <Icon name={"ios-stats-chart-outline"} size={32} onPress={() => 
            navigation.navigate("accountDetail", { account: AccountType.Bitcoin })  } />
        </View>
        {error && 
          <ScrollView style={{flex: 1}}>
            <Text style={{color: palette.red, alignSelf: "center"}}>{error.message}</Text>
          </ScrollView>}
        <FlatList
          data={[{
            title: translate(`ScanningQRCodeScreen.title`), icon: "send", target: "scanningQRCode"
          },{
            title: translate(`ReceiveBitcoinScreen.title`), icon: "receive", target: "receiveBitcoin"
          }]}
          extraData={store.accountRefresh}
          style={styles.listContainer}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={() => refreshQuery()} />}
          renderItem={({ item }) => (
            <LargeButton
              title={item.title}
              icon={<IconTransaction type={item.icon} size={75} color={palette.orange} />}
              onPress={() => onBitcoinClick(item.target)}
            />
          )}
        />
        <View style={{marginBottom: 32, alignItems: "center", marginTop: 32}}>
          <Icon name={"ios-flash"} 
            size={32} onPress={() => setSecretMenuCounter(secretMenuCounter + 1)} />
          <Text style={styles.lightningText}>{`We use the Lightning Network.`}</Text>
        </View>
    </Screen>
  )
})