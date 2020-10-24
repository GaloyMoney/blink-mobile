import messaging from '@react-native-firebase/messaging'
import { observer } from "mobx-react"
import * as React from "react"
import { useEffect, useState } from "react"
import { AppState, FlatList, RefreshControl, Text, View } from "react-native"
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
  },

  bottom: {
    marginVertical: "16rem", 
    alignItems: "center", 
  },

  buttonStyleTime: {
    borderRadius: "38rem",
    width: "50rem",
    backgroundColor: palette.white,
  },
})


export const MoveMoneyScreenDataInjected = observer(({ navigation }) => {
  const store = React.useContext(StoreContext)

  const updateQuery = store => store.mainQuery()
  const { query, error, loading, setQuery } = useQuery(updateQuery)

  const refreshQuery = async () => {
    console.tron.log("refresh query")
    setQuery(updateQuery)
    await query.refetch()
  }

  // temporary fix until we have a better management of notifications:
  // when coming back to active state. look if the invoice has been paid
  useEffect(() => {
    const _handleAppStateChange = async (nextAppState) => {
      if (nextAppState === "active") {
        // TODO: fine grain query
        // only refresh as necessary
        refreshQuery()
      }
    };

    AppState.addEventListener("change", _handleAppStateChange);

    return () => {
      AppState.removeEventListener("change", _handleAppStateChange);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      // TODO: fine grain query
      // only refresh as necessary
      refreshQuery()
    })

    return unsubscribe;
  }, []); 

  const walletActivated = store.user.level > 0

  return <MoveMoneyScreen 
    navigation={navigation}
    walletActivated={walletActivated}
    loading={loading}
    error={error}
    amount={store.balances({currency: "USD", account: AccountType.BankAndBitcoin})}
    amountOtherCurrency={store.balances({
      currency: CurrencyType.BTC,
      account: AccountType.BankAndBitcoin,
    })}
    refreshQuery={refreshQuery}
  />
})

export const MoveMoneyScreen = (
  ({ walletActivated, navigation, loading, error, 
    refreshQuery, amount, amountOtherCurrency }) => {

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
        <View style={{flexDirection: "row", alignItems: "center", justifyContent: "center"}}>
          <BalanceHeader
            loading={loading}
            currency={CurrencyType.USD}
            amount={amount}
            amountOtherCurrency={amountOtherCurrency}
            style={{marginLeft: 60}}
          />
          <Button
            buttonStyle={styles.buttonStyleTime} 
            containerStyle={{marginTop: 32, marginLeft: 16 }}
            onPress={() => navigation.navigate("accountDetail", { account: AccountType.Bitcoin }) }
            icon={<Icon name={"ios-trending-up-outline"} size={32} />}  
          />
        </View>

        <FlatList
          ListHeaderComponent={() => <>
            {error?.response?.errors?.map(({ message }) => 
             <Text style={{color: palette.red, alignSelf: "center", paddingBottom: 18}} selectable={true}>{message}</Text>
          )}
          </>}
          data={[{
            title: translate(`ScanningQRCodeScreen.title`), isReceive: false, target: "scanningQRCode"
          },{
            title: translate(`ReceiveBitcoinScreen.title`), isReceive: true, target: "receiveBitcoin"
          }]}
          style={styles.listContainer}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshQuery} />}
          renderItem={({ item }) => (
            <LargeButton
              title={item.title}
              icon={<IconTransaction isReceive={item.isReceive} size={75} />}
              onPress={() => onBitcoinClick(item.target)}
            />
          )}
        />
        <View style={styles.bottom}>
          <Icon name={"ios-flash"} 
            size={32} onPress={() => setSecretMenuCounter(secretMenuCounter + 1)} />
          <Text style={styles.lightningText}>{translate("MoveMoneyScreen.useLightning")}</Text>
        </View>
    </Screen>
  )
})