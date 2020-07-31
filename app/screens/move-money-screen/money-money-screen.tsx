import { observer } from "mobx-react"
import * as React from "react"
import { useState } from "react"
import { ScrollView, Text, View } from "react-native"
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
import { StoreContext } from "../../models"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { AccountType, CurrencyType } from "../../utils/enum"
import { capitalize } from "../../utils/helper"


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
})

export const MoveMoneyScreenDataInjected = observer(
  ({ navigation }) => {
    const store = React.useContext(StoreContext)

    const walletActivated = store.user.level > 0

    return <MoveMoneyScreen 
      navigation={navigation}
      walletActivated={walletActivated}
      amount={store.balances({currency: "BTC", account: AccountType.Bitcoin})} // FIXME add USD as well
    />
})

export const MoveMoneyScreen = (
  ({ walletActivated, navigation, amount }) => {

  const [modalVisible, setModalVisible] = useState(false)
  const [buttonAction, setButtonAction] = useState(() => () => {})

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
      <ScrollView style={{flex: 1}}>
        <BalanceHeader currency={CurrencyType.BTC} amount={amount} />
          <LargeButton
            title={translate(`ScanningQRCodeScreen.title`)}
            icon={<IconTransaction type={"send"} size={75} color={palette.orange} />}
            onPress={() => onBitcoinClick("scanningQRCode")}
          />
          <LargeButton
            title={translate(`ReceiveBitcoinScreen.title`)}
            icon={<IconTransaction type={"receive"} size={75} color={palette.orange} />}
            onPress={() => onBitcoinClick("receiveBitcoin")}
          />
        <View style={{marginBottom: 32, alignItems: "center", marginTop: 32}}>
          <Icon name={"ios-thunderstorm"} 
            size={32} onPress={() => setSecretMenuCounter(secretMenuCounter + 1)} />
          <Text 
            style={styles.lightningText}>
              {`We use the Lightning Network.`}
            </Text>
        </View>
      </ScrollView>
    </Screen>
  )
})