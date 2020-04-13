import auth from "@react-native-firebase/auth"
import { inject } from "mobx-react"
import * as React from "react"
import { useState } from "react"
import { ScrollView, StyleSheet, Text, View } from "react-native"
import { Button, ListItem } from "react-native-elements"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import Modal from "react-native-modal"
import Icon from "react-native-vector-icons/Ionicons"
import { Onboarding } from "types"
import { Screen } from "../../components/screen"
import { SyncingComponent } from "../../components/syncing"
import { translate } from "../../i18n"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { FirstChannelStatus } from "../../utils/enum"
import { capitalize, showFundingTx } from "../../utils/helper"

const styles = StyleSheet.create({
  screenStyle: {
    backgroundColor: palette.lighterGrey
  },

  buttonStyle: {
    borderColor: color.primary,
    borderRadius: 32,
    borderWidth: 2,
    width: "100%"
  },

  titleStyle: {
    color: color.primary,
    fontWeight: "bold",
    fontSize: 24,
  },

  listItem: {
    marginVertical: 12,
    marginHorizontal: 24,
    borderRadius: 8,
  },

  buttonContainer: {
    marginTop: 24,
    paddingHorizontal: 15,
  },

  flex: {
    flex: 1,
  },

  headerSection: {
    fontSize: 20,
    fontWeight: "bold",
    margin: 22,
    color: palette.blue,
  },

  icon: {
    marginRight: 12,
    textAlign: "center",
    width: 32,
  },

  text: {
    color: palette.darkGrey,
    fontSize: 22,
  },

  viewModal: {
    alignItems: "center",
    backgroundColor: palette.white,
    height: "25%",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
  },
})

export const MoveMoneyScreen = inject("dataStore")(({ dataStore, navigation }) => {

  const [modalVisible, setModalVisible] = useState(false)
  const [message, setMessage] = useState("")
  const [buttonTitle, setButtonTitle] = useState("")
  const [buttonAction, setButtonAction] = useState(() => () => {})
  const [syncing, setSyncing] = useState(false)

  const bank = [
    {
      icon: "ios-exit",
      target: "bankTransfer",
    },
    {
      icon: "ios-download",
      target: "directDeposit",
    },
    {
      icon: "ios-pin",
      target: "findATM",
    },
    {
      icon: "ios-cash",
      target: "depositCash",
    },
  ]
  const bitcoin = [
    {
      icon: "ios-exit",
      target: "scanningQRCode",
    },
    {
      icon: "ios-download",
      target: "receiveBitcoin",
    },
  ]

  const onBankClick = ({ target, title }) => {
    if (dataStore.onboarding.has(Onboarding.bankOnboarded)) {
      navigation.navigate(target, { title })
    } else {
      setMessage(translate("MoveMoneyScreen.needBankAccount", { feature: target }))
      setModalVisible(true)
      setButtonTitle(translate("MoveMoneyScreen.openAccount"))
      setButtonAction(() => () => {
        setModalVisible(false)
        navigation.navigate("openBankAccount")
      })
      setSyncing(false)
    }
  }

  const onBitcoinClick = ({ target }) => {
    if (dataStore.lnd.statusFirstChannel === FirstChannelStatus.opened) {
      navigation.navigate(target)
    } else if (auth().currentUser?.isAnonymous) {
      setMessage(translate("MoveMoneyScreen.needWallet"))
      setModalVisible(true)
      setButtonTitle(translate("MoveMoneyScreen.openWallet"))
      setButtonAction(() => () => {
        setModalVisible(false)
        navigation.navigate("phoneValidation")
      })
      setSyncing(false)
    } else {
      // wallet is being created
      setMessage(translate("MoveMoneyScreen.walletInCreation"))
      setModalVisible(true)
      if (dataStore.lnd.statusFirstChannel === FirstChannelStatus.pending) {
        setButtonAction(() => () => showFundingTx(dataStore.lnd.fundingTx))
        setButtonTitle(translate("MoveMoneyScreen.seeTransaction"))
        setSyncing(false)
        // need to sync the chain?
      } else {
        setSyncing(true)
      }
    }
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
          <Text style={styles.text}>{message}</Text>
          {(syncing && (
            <View style={styles.buttonContainer}>
              <SyncingComponent />
            </View>
          )) || (
            <Button
              title={buttonTitle}
              onPress={() => buttonAction()}
              type="outline"
              buttonStyle={styles.buttonStyle}
              titleStyle={styles.titleStyle}
              containerStyle={{marginTop: 24}}
            />
          )}
          <View style={{flex: 1}} />
        </View>
      </Modal>
      <ScrollView>
        <Text style={styles.headerSection}>{translate("common.bank")}</Text>
        {bank.map((item, i) => (
          <ListItem
            titleStyle={styles.text}
            containerStyle={styles.listItem}
            key={i}
            title={translate(`${capitalize(item.target)}Screen.title`)}
            leftIcon={<Icon name={item.icon} style={styles.icon} size={32} color={color.primary} />}
            onPress={(item) => onBankClick(item)}
            chevron
          />
        ))}
        <Text style={styles.headerSection}>{translate("common.bitcoin")}</Text>
        {bitcoin.map((item, i) => (
          <ListItem
            titleStyle={styles.text}
            containerStyle={styles.listItem}
            key={i}
            title={translate(`${capitalize(item.target)}Screen.title`)}
            leftIcon={<Icon name={item.icon} style={styles.icon} size={32} color={color.primary} />}
            onPress={() => onBitcoinClick(item)}
            chevron
          />
        ))}
      </ScrollView>
    </Screen>
  )
})
