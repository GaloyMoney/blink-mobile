import { inject, observer } from "mobx-react"
import * as React from "react"
import { useState } from "react"
import { ScrollView, Text, View } from "react-native"
import { Button, ListItem, ButtonGroup } from "react-native-elements"
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
import { BalanceHeader } from "../../components/balance-header"
import { CurrencyType } from "../../utils/enum"
import { LargeButton } from "../../components/large-button"
import { IconTransaction } from "../../components/icon-transactions"
import { BrightButton } from "../../components/bright-button"


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

  headerView: {
    marginHorizontal: "20rem",
    marginTop: "12rem",
    marginBottom: "6rem",
  }
})

export const MoveMoneyScreenDataInjected = inject("dataStore")(observer(
  ({ dataStore, navigation }) => {
    const bankOnboarded = dataStore.onboarding.has(Onboarding.bankOnboarded)
    const walletActivated = dataStore.onboarding.has(Onboarding.walletActivated)

    return <MoveMoneyScreen 
      bankOnboarded={bankOnboarded}
      navigation={navigation}
      walletActivated={walletActivated}
      amount={dataStore.lnd.balance} // FIXME add USD as well
    />
}))

export const MoveMoneyScreen = (
  ({ bankOnboarded, walletActivated, navigation, amount }) => {

  const [modalVisible, setModalVisible] = useState(false)
  const [message, setMessage] = useState("")
  const [buttonTitle, setButtonTitle] = useState("")
  const [buttonAction, setButtonAction] = useState(() => () => {})
  const [selectedIndex, setSelectedIndex] = useState(0)

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
      icon: <IconTransaction type={"send"} size={75} color={palette.orange} />,
      target: "scanningQRCode",
    },
    {
      icon: <IconTransaction type={"receive"} size={75} color={palette.orange} />,
      target: "receiveBitcoin",
    },
  ]

  const onBankClick = ({ target, title }) => {
    if (bankOnboarded) {
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
    if (walletActivated) {
      navigation.navigate(target)
    } else {
      setMessage(translate("MoveMoneyScreen.needWallet"))
      setModalVisible(true)
      setButtonTitle(translate("MoveMoneyScreen.openWallet"))
      setButtonAction(() => () => {
        setModalVisible(false)
        navigation.navigate("phoneValidation")
      })
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
      <View style={styles.headerView}>
        <ButtonGroup
          onPress={index => setSelectedIndex(index)}
          selectedIndex={selectedIndex}
          buttons={["Bitcoin", "Bank"]}
          // selectedButtonStyle={{}}
          selectedTextStyle={{fontWeight: "bold", fontSize: 18}}
          disabledTextStyle={{fontWeight: "bold"}}
          containerStyle={{borderRadius: 50}}
          selectedButtonStyle={{backgroundColor: palette.lightBlue}}
        />
      </View>
      <ScrollView style={{flex: 1}}>
        {selectedIndex === 0 &&
          <>
            <BalanceHeader currency={CurrencyType.BTC} amount={amount} />
            {bitcoin.map((item, i) => (
              <LargeButton
                title={translate(`${capitalize(item.target)}Screen.title`)}
                icon={item.icon}
                onPress={() => onBitcoinClick(item)}
              />
            ))}
            <View style={{marginBottom: 32, alignItems: "center", marginTop: 32}}>
              <Icon name={"ios-thunderstorm"} size={32} />
              <Text style={styles.lightningText}>{`We use the Lightning Network.\nLearn More`}</Text>
            </View>
          </>
        }
        {selectedIndex === 1 &&
        <>
          <View style={{marginVertical: 32, alignItems: "center"}}>
            <Text style={{color: palette.blue, fontSize: 18, fontWeight: "bold"}}>Coming Soon!</Text>
            <BrightButton title={"Join the waiting list"} />
          </View>
          {bank.map((item, i) => (
            <LargeButton
              title={translate(`${capitalize(item.target)}Screen.title`)}
              icon={<Icon name={item.icon} style={styles.icon} size={48} color={palette.lightGrey} />}
              onPress={(item) => onBankClick(item)}
              titleStyle={{
                color: palette.midGrey,
                fontWeight: "bold",
                fontSize: 18,
              }}
            />
          ))}
        </>
        }
      </ScrollView>
    </Screen>
  )
})
