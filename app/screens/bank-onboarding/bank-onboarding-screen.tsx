import * as React from "react"
import { Screen } from "../../components/screen"
import { Onboarding } from "../../components/onboarding"
import { Text } from "../../components/text"
import { StyleSheet } from "react-native"
import { BalanceHeader } from "../../components/balance-header"
import { CurrencyType, AccountType } from "../../utils/enum"
import { useNavigation } from "react-navigation-hooks"
import { Button } from "react-native"


export const bankLogo = require("./BankLogo.png")

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    paddingHorizontal: 40,
    fontWeight: 'bold'
  },

  text: {
    fontSize: 18,
    textAlign: "center",
    paddingHorizontal: 40,
  },

})

export const OpenBankAccountScreen = () => {
  const { navigate } = useNavigation()
  return (
    <Screen>
      <BalanceHeader headingCurrency={CurrencyType.USD} accountsToAdd={AccountType.Checking} />
      <Text style={styles.title}>Open a Galoy bank account</Text>
      <Text style={styles.text}>Hold US dollars in your account! Order a debit card to earn 1%+ cashback in bitcoin on your spending! And easily buy & sell bitcoin in-app.</Text>
      <Button title="Open account" onPress={() => navigate('bankRewards')} />
    </Screen>
  )
}


export const BankRewardsScreen = () => {
  return (
    <Screen>
      <Onboarding next="personalInformation" image={bankLogo}>
        <Text style={styles.text}>You’re just a few minutes away from own Galoy bank account! Order a debit card to receive 1% bitcoin rewards on all spending.</Text>
      </Onboarding>
    </Screen>
  )
}

export const PersonalInformationScreen = () => {
  return (
    <Screen>
      <Text style={styles.text}>To get started, tell us about yourself.</Text>
      <Text style={styles.text}>First Name</Text>
      <Text style={styles.text}>Last Name</Text>
      <Text style={styles.text}>Email</Text>
      <Text style={styles.text}>Date of Birth</Text>
      <Text style={styles.text}>Your information is encrypted and securely transmit using SSL</Text>
      <Button title="Confirm" />
    </Screen>
  )
}

