import * as React from "react"
import { useState, useEffect } from "react"

import { Screen } from "../../components/screen"
import { StyleSheet, Alert } from "react-native"
import { Text } from "../../components/text"
import { OnboardingScreen } from "../../components/onboarding"
import { useNavigation } from "react-navigation-hooks"
import { inject } from "mobx-react"
import { Onboarding } from "../../../../common/types"

export const cloudLogo = require("./CloudLogo.png")


const styles = StyleSheet.create({
    text: {
      fontSize: 18,
      textAlign: "center",
      paddingHorizontal: 40,
      paddingVertical: 20,
    },
})

export const WalletBackupScreen = inject("dataStore")(
    ({ dataStore }) => {

    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState("")

    const { goBack } = useNavigation()

    const onPress = async () => {
      try {
        await dataStore.onboarding.add(Onboarding.backupWallet)
        goBack(null)
      } catch (err) {
        console.tron.log(err.toString())
        setErr(err.toString())
      }
    }

    useEffect(() => {
        if (err !== "") {
          setErr("")
          Alert.alert("error", err, [
            {
              text: "OK",
              onPress: () => {
                setLoading(false)
              },
            },
          ])
        }
      }, [err])

    return (
        <Screen>
          <OnboardingScreen 
                nextTitle="Back up" action={onPress}
                image={cloudLogo} loading={loading}
                >
              <Text style={styles.text}>
                Now that you have some sats, you need to backup your wallet
              </Text>
          </OnboardingScreen>
        </Screen>
    )
})

WalletBackupScreen.navigationOptions = () => ({
    title: "Wallet Backup"
})
