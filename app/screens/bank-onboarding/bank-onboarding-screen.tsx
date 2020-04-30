import DateTimePicker from "@react-native-community/datetimepicker"
import auth from "@react-native-firebase/auth"
import functions from "@react-native-firebase/functions"
import { useNavigation, useRoute } from "@react-navigation/native"
import { inject } from "mobx-react"
import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { Alert, Text, TextInput, View } from "react-native"
import { Button, Input } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { Onboarding } from "types"
import { CloseCross } from "../../components/close-cross"
import { OnboardingScreen } from "../../components/onboarding"
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { palette } from "../../theme/palette"
import { emailIsValid } from "../../utils/helper"
import HoneyBadgerHello from "./badger-wave-01.svg"
import { BrightButton } from "../../components/bright-button"
import CreditCard from "./credit-card-01.svg"
import BitcoinPhone from "./bitcoin-phone-01.svg"
import MoneyCircle from "../accounts-screen/money-circle-02.svg"

const bankLogo = require("./BankLogo.png")
const popcornLogo = require("../earns-screen/PopcornLogo.png")

const styles = EStyleSheet.create({
  buttonContainer: {
    paddingBottom: 40,
    minWidth: "100rem", // TODO check if this works as intended
    marginHorizontal: "40rem", 
    paddingTop: 20,
  },

  buttonStyle: {
    backgroundColor: palette.lightBlue,
    borderRadius: 32,
  },

  text: {
    fontSize: 18,
    paddingHorizontal: 40,
    paddingTop: 100,
    textAlign: "center",
  },

  argumentText: {
    fontSize: 18,
    paddingHorizontal: 40,
    textAlign: "left",
  },

  textInfos: {
    fontSize: 18,
    paddingHorizontal: 40,
    paddingVertical: 20,
    textAlign: "center",
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    paddingHorizontal: 40,
    paddingTop: 60,
    paddingBottom: 20,
    textAlign: "center",
  },
})

const Argument = ({text, Icon}) => (
  <View style={{flexDirection: "row", marginBottom: 20, marginHorizontal: 18, alignItems: 'center'}}>
    <View style={{alignItems: "center", width: 32, marginLeft: 12}}>
      <Icon />
    </View>
    <Text style={styles.argumentText}>{text}</Text>
  </View>
)

export const BankAccountEarnScreen = ({ navigation }) => {
  
  return (
    <Screen preset="scroll" backgroundColor={palette.lightGrey}>
      <View style={{margin: 40, backgroundColor: palette.white, borderRadius: 24}}>
        <View style={{alignSelf: "center", marginTop: 60}}>
          <HoneyBadgerHello />
        </View>
        <Text style={styles.title}>{translate("BankAccountEarnScreen.openAccount")}</Text>
        <Argument 
          text={translate("BankAccountEarnScreen.holdUSDollar")} 
          Icon={() => <MoneyCircle width={40}/>} />
        <Argument 
          text={translate("BankAccountEarnScreen.debitCard")} 
          Icon={() => <CreditCard />} />
        <Argument 
          text={translate("BankAccountEarnScreen.buySell")} 
          Icon={() => <BitcoinPhone />} />
        <View style={{ flex: 1 }} />
        <BrightButton
          title="Join the waiting list"
          // onPress={() => navigation.navigate("openBankAccount")}
        />
      <CloseCross color={palette.darkGrey} onPress={() => navigation.goBack()} />
      </View>
    </Screen>
  )
}

export const OpenBankScreen = ({ navigation }) => {
  return (
    <Screen>
      <OnboardingScreen
        image={bankLogo}
        action={() => {
          auth().currentUser?.isAnonymous
            ? navigation.navigate("welcomePhoneInputBanking") // FIXME should be welcomePhoneInput
            : navigation.navigate("personalInformation")
        }}
      >
        <Text style={styles.text}>{translate("OpenBankScreen.accountsBenefits")}</Text>
      </OnboardingScreen>
    </Screen>
  )
}

const TextInputLightMode = (props) => (
  <TextInput placeholderTextColor={palette.lightGrey} {...props} />
)

export const PersonalInformationScreen = () => {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")

  const secondTextInput = useRef(null)
  const thirdTextInput = useRef(null)

  const { navigate } = useNavigation()

  const onValidate = () => {
    if (!emailIsValid(email)) {
      Alert.alert(translate("errors.invalidEmail"))
      return
    }

    navigate("dateOfBirth", { firstName, lastName, email })
  }

  return (
    <Screen>
      <Text style={styles.textInfos}>{translate("PersonalInformationScreen.getStarted")}</Text>
      <Input
        placeholder={translate("common.firstName")}
        onChangeText={(input) => setFirstName(input)}
        autoFocus={true}
        returnKeyType={"next"}
        blurOnSubmit={false}
        textContentType="givenName"
        inputComponent={TextInputLightMode}
        onSubmitEditing={() => {
          secondTextInput.current.focus()
        }}
      />
      <Input
        placeholder={translate("common.lastName")}
        onChangeText={(input) => setLastName(input)}
        ref={secondTextInput}
        returnKeyType={"next"}
        blurOnSubmit={false}
        textContentType="familyName"
        inputComponent={TextInputLightMode}
        onSubmitEditing={() => {
          thirdTextInput.current.focus()
        }}
      />
      <Input
        placeholder={translate("common.email")}
        onChangeText={(input) => setEmail(input)}
        ref={thirdTextInput}
        returnKeyType={"done"}
        textContentType="emailAddress"
        blurOnSubmit={true}
        inputComponent={TextInputLightMode}
        onSubmitEditing={onValidate}
      />
      <Text style={styles.textInfos}>{translate("common.SSL")}</Text>
      <Button
        title={translate("common.confirm")}
        onPress={onValidate}
        containerStyle={styles.buttonContainer}
        buttonStyle={styles.buttonStyle}
      />
    </Screen>
  )
}

export const DateOfBirthScreen = inject("dataStore")(({ dataStore }) => {
  const navigation = useNavigation()
  const route = useRoute()
  const [dateOfBirth, setDateOfBirth] = useState(new Date(2000, 1, 1))
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")

  const onValidate = async () => {
    try {
      setLoading(true)
      await functions().httpsCallable("onBankAccountOpening")({
        ...route.params,
        dateOfBirth: dateOfBirth.toISOString(),
      })
      dataStore.onboarding.add(Onboarding.bankOnboarded)
      navigation.navigate("bankAccountReady")
      setLoading(false)
    } catch (err) {
      console.tron.error(err)
      setErr(err.toString())
    }
  }

  useEffect(() => {
    if (err !== "") {
      Alert.alert(translate("common.error"), err, [
        {
          text: translate("common.ok"),
          onPress: () => {
            setLoading(false)
          },
        },
      ])
      setErr("")
    }
  }, [err])

  return (
    <Screen>
      <DateTimePicker
        style={{ paddingTop: 30 }}
        mode="date"
        display="default"
        value={dateOfBirth}
        onChange={(_, input) => {
          setDateOfBirth(input)
        }}
      />
      {/* FIXME could timezone be an issue?  */}
      <Text style={styles.textInfos}>{translate("common.SSL")}</Text>
      <Button
        title={translate("common.confirm")}
        onPress={onValidate}
        containerStyle={styles.buttonContainer}
        buttonStyle={styles.buttonStyle}
        loading={loading}
        disabled={loading}
      />
    </Screen>
  )
})

export const BankAccountReadyScreen = () => {
  return (
    <Screen>
      <OnboardingScreen next="accounts" nextTitle="Okay" image={popcornLogo}>
        <Text style={styles.text}>{translate("BankAccountReadyScreen.accountReady")}</Text>
      </OnboardingScreen>
    </Screen>
  )
}
