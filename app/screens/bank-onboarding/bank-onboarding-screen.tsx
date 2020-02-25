import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { Screen } from "../../components/screen"
import { OnboardingScreen } from "../../components/onboarding"
import { Text } from "../../components/text"
import { StyleSheet, Alert, View, TextInput } from "react-native"
import { BalanceHeader } from "../../components/balance-header"
import { CurrencyType, AccountType } from "../../utils/enum"
import { useNavigation } from "react-navigation-hooks"
import DateTimePicker from "@react-native-community/datetimepicker"
import { Input, Button } from "react-native-elements"
import { Button as ButtonNative } from "react-native"
import { withNavigation } from "react-navigation"
import functions from "@react-native-firebase/functions"
import { inject } from "mobx-react"
import { color } from "../../theme"
import { Onboarding } from "types"
import { translate } from "../../i18n"
import { palette } from "../../theme/palette"
import { emailIsValid } from "../../utils/helper"
import auth from "@react-native-firebase/auth"


const bankLogo = require("./BankLogo.png")
const popcornLogo = require("../rewards-screen/PopcornLogo.png")

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    paddingTop: 60,
    paddingHorizontal: 40,
    textAlign: "center",
    fontWeight: "bold",
  },

  text: {
    paddingTop: 100,
    fontSize: 18,
    textAlign: "center",
    paddingHorizontal: 40,
  },

  textInfos: {
    paddingVertical: 20,
    fontSize: 18,
    textAlign: "center",
    paddingHorizontal: 40,
  },

  buttonContainer: {
    paddingTop: 20,
    paddingHorizontal: 80,
    paddingBottom: 60,
  },

  buttonStyle: {
    backgroundColor: color.primary,
  },
})

export const BankAccountRewardsScreen = () => {
  const { navigate } = useNavigation()
  return (
    <Screen>
      <BalanceHeader headingCurrency={CurrencyType.USD} accountsToAdd={AccountType.Bank} />
      <Text style={styles.title}>{translate("BankAccountRewardsScreen.openAccount")}</Text>
      <Text style={styles.text}>{translate("BankAccountRewardsScreen.accountsBenefits")}</Text>
      <View style={{ flex: 1 }} />
      <Button
        title="Open account"
        onPress={() => navigate("openBankAccount")}
        containerStyle={styles.buttonContainer}
        buttonStyle={styles.buttonStyle}
      />
    </Screen>
  )
}

BankAccountRewardsScreen.navigationOptions = () => ({
  title: translate("BankAccountRewardsScreen.title"),
})

export const OpenBankScreen = () => {
  const { navigate } = useNavigation()
  return (
    <Screen>
      <OnboardingScreen image={bankLogo}
        action={() => {
          auth().currentUser?.isAnonymous ?
            navigate("welcomePhoneInputBanking"): // FIXME should be welcomePhoneInput
            navigate("personalInformation")
        }}
      >
        <Text style={styles.text}>{translate("OpenBankScreen.accountsBenefits")}</Text>
      </OnboardingScreen>
    </Screen>
  )
}

OpenBankScreen.navigationOptions = screenProps => ({
  title: translate("OpenBankScreen.title"),
  headerLeft: () => (
    <ButtonNative title="< Back" onPress={() => screenProps.navigation.navigate("primaryStack")} />
  ),
}) // FIXME < back button

const TextInputLightMode = props => (
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
        onChangeText={input => setFirstName(input)}
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
        onChangeText={input => setLastName(input)}
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
        onChangeText={input => setEmail(input)}
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

PersonalInformationScreen.navigationOptions = screenProps => ({
  title: translate("PersonalInformationScreen.title"),
})

export const DateOfBirthScreen = withNavigation(
  inject("dataStore")(({ navigation, dataStore }) => {
    const [dateOfBirth, setDateOfBirth] = useState(new Date(2000, 1, 1))
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState("")

    const onValidate = async () => {
      try {
        setLoading(true)
        await functions().httpsCallable("onBankAccountOpening")({
          ...navigation.state.params,
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
  }),
)

DateOfBirthScreen.navigationOptions = screenProps => ({
  title: translate("DateOfBirthScreen.title"),
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

BankAccountReadyScreen.navigationOptions = screenProps => ({
  title: translate("common.bankAccount"),
  header: () => false,
})
