import messaging from '@react-native-firebase/messaging'
import { observer } from "mobx-react"
import * as React from "react"
import { useEffect, useState } from "react"
import { AppState, FlatList, Linking, Pressable, RefreshControl, Text, View } from "react-native"
import { Button, Card, ListItem } from "react-native-elements"
import EStyleSheet from 'react-native-extended-stylesheet'
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import Modal from "react-native-modal"
import Toast from "react-native-root-toast"
import Icon from "react-native-vector-icons/Ionicons"
import { BalanceHeader } from "../../components/balance-header"
import { IconTransaction } from "../../components/icon-transactions"
import { LargeButton } from "../../components/large-button"
import { Screen } from "../../components/screen"
import { TransactionItem } from "../../components/transaction-item"
import { translate } from "../../i18n"
import { useQuery } from "../../models"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { AccountType, CurrencyType } from "../../utils/enum"
import { isIos } from "../../utils/helper"
import { info } from "../../utils/info"
import NetInfo from "@react-native-community/netinfo";


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

  transactionsView: {
    marginHorizontal: "30rem",
    flex: 1,
  }
})


export const connectionIssue = (error) => !!error && Object.keys(error).length === 0

export const MoveMoneyScreenDataInjected = observer(({ navigation }) => {
  const { store, error, loading, setQuery } = useQuery()

  const refreshQuery = async () => {
    setQuery(store => store.mainQuery())
  }

  useEffect(() => {
    refreshQuery()
  }, [])

  console.tron.log({store})

  useEffect(() => {
    if (store.walletIsActive) {
      info(store.mutateAddDeviceToken)

      const unsubscribe = NetInfo.addEventListener(state => {
        console.log("Connection type", state.type);
        console.log("Is connected?", state.isConnected);
      });
      
      // Unsubscribe
      return unsubscribe();
    }
  }, [store.walletIsActive])


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

  return <MoveMoneyScreen 
    navigation={navigation}
    walletIsActive={store.walletIsActive}
    loading={loading}
    error={error}
    amount={store.balances({currency: "USD", account: AccountType.Bitcoin})}
    amountOtherCurrency={store.balances({
      currency: CurrencyType.BTC,
      account: AccountType.Bitcoin,
    })}
    refreshQuery={refreshQuery}
    isUpdateAvailable={store.isUpdateAvailable}
    transactions={store.lastTransactions}
  />
})

export const MoveMoneyScreen = (
  ({ walletIsActive, navigation, loading, error, transactions,
    refreshQuery, amount, amountOtherCurrency, isUpdateAvailable }) => {

  const [modalVisible, setModalVisible] = useState(false)

  React.useEffect(() => {
    if (connectionIssue(error) === true) {
      Toast.show(translate("common.connectionIssue"), {
        duration: Toast.durations.LONG,
        shadow: false,
        animation: true,
        hideOnPress: true,
        delay: 0,
        position: 160,
        opacity: 1,
        backgroundColor: palette.red,
      })
    }
  }, [connectionIssue(error)])
  

  const [secretMenuCounter, setSecretMenuCounter] = useState(0)
  React.useEffect(() => {
    if (secretMenuCounter > 2) {
      navigation.navigate("Profile")
      setSecretMenuCounter(0)
    }
  }, [secretMenuCounter])

  const onMenuClick = (target) => {
    walletIsActive ? navigation.navigate(target) : setModalVisible(true)
  }

  const activateWallet = () => {
    setModalVisible(false)
    navigation.navigate("phoneValidation")
  }


  const testflight = `https://testflight.apple.com/join/9aC8MMk2`
  const appstore = "https://apps.apple.com/app/bitcoin-beach-wallet/id1531383905"

  // from https://github.com/FiberJW/react-native-app-link/blob/master/index.js
  const openInStore = async ({ appName, appStoreId, appStoreLocale = 'us', playStoreId }) => {
    if (isIos) {
      Linking.openURL(appstore);
      // Linking.openURL(`https://itunes.apple.com/${appStoreLocale}/app/${appName}/id${appStoreId}`);
    } else {
      Linking.openURL(`https://play.google.com/store/apps/details?id=${playStoreId}`);
    }
  };

  const linkUpgrade = () => openInStore({ appName: "Bitcoin Beach Wallet", appStoreId: "", playStoreId: 'com.galoyapp' }).then(() => {
    console.tron.log("clicked on link")
  })
  .catch((err) => {
    console.tron.log("error app link on link")
    // handle error
  });

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
        <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-around"}}>
          <Button
            buttonStyle={styles.buttonStyleTime} 
            containerStyle={{marginTop: 32}}
            onPress={() => navigation.navigate("priceDetail", { account: AccountType.Bitcoin }) }
            icon={<Icon name={"ios-trending-up-outline"} size={32} />}  
          />
          <BalanceHeader
            loading={loading}
            currency={CurrencyType.USD}
            amount={amount}
            amountOtherCurrency={amountOtherCurrency}
            style={{}}
          />
          <Button
            buttonStyle={styles.buttonStyleTime} 
            containerStyle={{marginTop: 32 }}
            onPress={() => navigation.navigate("settings") }
            icon={<Icon name={"ios-settings-outline"} size={32} />}  
          />
        </View>

        <FlatList
          ListHeaderComponent={() => <>
            {error?.response?.errors?.map(({ message }) => 
             <Text style={{color: palette.red, alignSelf: "center", paddingBottom: 18}} selectable={true}>{message}</Text>
          )}
          </>}
          data={[{
            title: translate(`ScanningQRCodeScreen.title`),
            target: "scanningQRCode",
            icon: <Icon name={"qr-code"} size={32} color={palette.orange} />, 
          }, 
          {
            title: translate(`MoveMoneyScreen.send`), 
            target: "sendBitcoin",
            icon: <IconTransaction isReceive={false} size={32} />,
          },
          {
            title: translate(`MoveMoneyScreen.receive`), 
            target: "receiveBitcoin",
            icon: <IconTransaction isReceive={true} size={32} />,
          },
          {
            title: translate(`TransactionScreen.title`), 
            target: "transactionHistory",
            icon: <Icon name={"ios-list-outline"} size={32} color={color} />,
            style: "transactionViewContainer",
            transactions,
          }
        ]}
          style={styles.listContainer}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshQuery} />}
          renderItem={({ item }) => 
            <>
              <LargeButton
                title={item.title}
                icon={item.icon}
                onPress={() => onMenuClick(item.target)}
                style={item.style}
              />
              { item.transactions &&
                <View style={styles.transactionsView}>
                  {
                    item.transactions.map((item, i) => <TransactionItem navigation={navigation} tx={item} subtitle={true} />)
                  }
                </View>
              }
            </>
          }
        />
        <View style={styles.bottom}>
          {isUpdateAvailable &&
            <Pressable onPress={linkUpgrade}>
              <Text style={[styles.lightningText, {marginBotton: 12}]}>{translate("MoveMoneyScreen.updateAvailable")}</Text>
            </Pressable>}
        </View>
    </Screen>
  )
})