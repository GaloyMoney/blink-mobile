import auth from "@react-native-firebase/auth"
import { inject } from "mobx-react"
import * as React from "react"
import { useState } from "react"
import { ScrollView, Text, View } from "react-native"
import { Button, ListItem } from "react-native-elements"
import EStyleSheet from 'react-native-extended-stylesheet'
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import Modal from "react-native-modal"
import Icon from "react-native-vector-icons/Ionicons"
import { Onboarding } from "types"
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
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

  headerSection: {
    fontSize: "20rem",
    fontWeight: "bold",
    marginHorizontal: "20rem",
    marginTop: "12rem",
    marginBottom: "8rem",
    color: palette.blue,
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
})

export const MoveMoneyScreen = inject("dataStore")(({ dataStore, navigation }) => {

  const [modalVisible, setModalVisible] = useState(false)
  const [message, setMessage] = useState("")
  const [buttonTitle, setButtonTitle] = useState("")
  const [buttonAction, setButtonAction] = useState(() => () => {})

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
      navigation.navigate("bankAccountRewards")

      // bankAccountRewards
      // setMessage(translate("MoveMoneyScreen.needBankAccount", { feature: target }))
      // setModalVisible(true)
      // setButtonTitle(translate("MoveMoneyScreen.openAccount"))
      // setButtonAction(() => () => {
      //   setModalVisible(false)
      //   navigation.navigate("openBankAccount")
      // })
      // setSyncing(false)
    }
  }

  const onBitcoinClick = ({ target }) => {
    if (auth().currentUser?.isAnonymous) {
      setMessage(translate("MoveMoneyScreen.needWallet"))
      setModalVisible(true)
      setButtonTitle(translate("MoveMoneyScreen.openWallet"))
      setButtonAction(() => () => {
        setModalVisible(false)
        navigation.navigate("phoneValidation")
      })
    } else {
      navigation.navigate(target)
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
          <Button
            title={buttonTitle}
            onPress={() => buttonAction()}
            type="outline"
            buttonStyle={styles.buttonStyle}
            titleStyle={styles.titleStyle}
            containerStyle={styles.buttonContainerStyle}
          />
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
