import * as React from "react"
import { useState } from "react"
import { Screen } from "../../components/screen"
import { StyleSheet, ScrollView, View } from "react-native"
import { Text } from "../../components/text"
import { color } from "../../theme"
import { ListItem, Button } from "react-native-elements"
import Icon from "react-native-vector-icons/Ionicons"
import { useNavigation } from '@react-navigation/native';
import { palette } from "../../theme/palette"
import { inject } from "mobx-react"
import { Onboarding } from "types"
import { translate } from "../../i18n"
import Modal from "react-native-modal"
import { FirstChannelStatus } from "../../utils/enum"
import { capitalize, showFundingTx } from "../../utils/helper"
import { SyncingComponent } from "../../components/syncing"
import auth from "@react-native-firebase/auth"


const styles = StyleSheet.create({
  headerSection: {
    fontWeight: "bold",
    fontSize: 20,
    margin: 22,
  },

  text: {
    fontSize: 22,
    color: palette.darkGrey,
  },

  button: {
    marginLeft: 20,
    backgroundColor: color.primary,
  },

  icon: {
    marginRight: 12,
    textAlign: "center",
    width: 32,
  },

  flex: {
    flex: 1,
  },

  viewModal: {
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    height: 200,
    backgroundColor: palette.white,
    alignItems: "center",
  },

  buttonContainer: {
    marginTop: 24,
    paddingHorizontal: 15,
    flex: 1,
  },
})

export const MoveMoneyScreen = inject("dataStore")(({ dataStore }) => {
  const { navigate } = useNavigation()

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
      navigate(target, { title })
    } else {
      setMessage(translate("MoveMoneyScreen.needBankAccount", {feature: target}))
      setModalVisible(true)
      setButtonTitle(translate("MoveMoneyScreen.openAccount"))
      setButtonAction(() => () => {
        setModalVisible(false)
        navigate("openBankAccount")
      })
      setSyncing(false)
    }
  }

  const onBitcoinClick = ({ target }) => {
    if (dataStore.lnd.statusFirstChannel === FirstChannelStatus.opened) {
      navigate(target)
    } else if (auth().currentUser?.isAnonymous) {
      setMessage(translate("MoveMoneyScreen.needWallet"))
      setModalVisible(true)
      setButtonTitle(translate("MoveMoneyScreen.openWallet"))
      setButtonAction(() => () => {
        setModalVisible(false)
        navigate("rewards", {card: "phoneVerification"})
      })
      setSyncing(false)
    } else { // wallet is being created
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
    <Screen>
      <Modal
        style={{ marginHorizontal: 0, marginBottom: 0 }}
        isVisible={modalVisible}
        swipeDirection={modalVisible ? ["down"] : ["up"]}
        onSwipeComplete={() => setModalVisible(false)}
        swipeThreshold={50}
      >
        {/* <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.flex} /> 
                </TouchableWithoutFeedback> */}
        <View style={styles.flex} />
        <View style={styles.viewModal}>
          <Icon
            name={"ios-remove"}
            size={64}
            color={palette.lightGrey}
            style={{ height: 34, top: -22 }}
          />
          <Text style={styles.text}>
            {message}
          </Text>
          { syncing &&
            <View style={styles.buttonContainer}>
              <SyncingComponent />
            </View>
            || 
            <Button
              title={buttonTitle}
              onPress={() => buttonAction()}
              buttonStyle={styles.button}
              containerStyle={[styles.buttonContainer, { width: "100%" }]}
            />
          }
        </View>
      </Modal>
      <ScrollView>
        <Text style={styles.headerSection}>{translate("common.bank")}</Text>
        {bank.map((item, i) => (
          <ListItem
            titleStyle={styles.text}
            style={styles.button}
            key={i}
            title={translate(`${capitalize(item.target)}Screen.title`)}
            leftIcon={<Icon name={item.icon} style={styles.icon} size={32} color={color.primary} />}
            onPress={() => onBankClick(item)}
            chevron
          />
        ))}
        <Text style={styles.headerSection}>{translate("common.bitcoin")}</Text>
        {bitcoin.map((item, i) => (
          <ListItem
            titleStyle={styles.text}
            style={styles.button}
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