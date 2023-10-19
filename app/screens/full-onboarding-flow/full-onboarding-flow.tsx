import { gql } from "@apollo/client"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import { Screen } from "@app/components/screen"
import {
  useFullOnboardingScreenQuery,
  useOnboardingFlowStartMutation,
} from "@app/graphql/generated"
import { AccountLevel, useLevel } from "@app/graphql/level-context"
import { useI18nContext } from "@app/i18n/i18n-react"
import { isIos } from "@app/utils/helper"
import Onfido, { OnfidoTheme } from "@onfido/react-native-sdk"
import { Input, Text, makeStyles } from "@rneui/themed"
import React, { useState } from "react"
import { Alert, View } from "react-native"

gql`
  mutation onboardingFlowStart($input: OnboardingFlowStartInput!) {
    onboardingFlowStart(input: $input) {
      workflowRunId
      tokenAndroid
      tokenIos
    }
  }

  query fullOnboardingScreen {
    me {
      id
      defaultAccount {
        id
      }
    }
  }
`

export const FullOnboardingFlowScreen: React.FC = () => {
  const { LL } = useI18nContext()

  const styles = useStyles()

  const { currentLevel } = useLevel()

  const { data } = useFullOnboardingScreenQuery()
  const accountId = data?.me?.defaultAccount?.id

  const [onboardingFlowStart] = useOnboardingFlowStartMutation()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")

  const confirmNames = async () => {
    Alert.alert(
      LL.FullOnboarding.confirmNameTitle(),
      LL.FullOnboarding.confirmNameContent({ firstName, lastName }),
      [
        { text: LL.common.cancel(), onPress: () => {} },
        {
          text: LL.common.yes(),
          onPress: onfidoStart,
        },
      ],
    )
  }

  const onfidoStart = async () => {
    if (!accountId) {
      console.log("no account id")
      return
    }

    const res = await onboardingFlowStart({
      variables: { input: { accountId, firstName, lastName } },
    })

    const workflowRunId = res.data?.onboardingFlowStart?.workflowRunId
    if (!workflowRunId) {
      Alert.alert("no workflowRunId")
      return
    }

    const tokenAndroid = res.data?.onboardingFlowStart?.tokenAndroid
    const tokenIos = res.data?.onboardingFlowStart?.tokenIos

    const sdkToken = isIos ? tokenIos : tokenAndroid

    if (!sdkToken) {
      Alert.alert("no sdkToken")
      return
    }

    try {
      /* eslint @typescript-eslint/ban-ts-comment: "off" */
      // @ts-expect-error
      const res = await Onfido.start({
        sdkToken,
        theme: OnfidoTheme.AUTOMATIC,
        workflowRunId,
      })

      Alert.alert(LL.FullOnboarding.success())
      console.log(res, "success")
    } catch (err) {
      Alert.alert(LL.FullOnboarding.error())
      console.log(err, "error")
    }
  }

  if (currentLevel === AccountLevel.Two) {
    return (
      <Screen
        preset="scroll"
        keyboardShouldPersistTaps="handled"
        keyboardOffset="navigationHeader"
        style={styles.screenStyle}
      >
        <Text type="h2">{LL.FullOnboarding.accountVerifiedAlready()}</Text>
      </Screen>
    )
  }

  return (
    <Screen
      preset="scroll"
      keyboardShouldPersistTaps="handled"
      keyboardOffset="navigationHeader"
      style={styles.screenStyle}
    >
      <Text type="h2" style={styles.textStyle}>
        {LL.FullOnboarding.requirements()}
      </Text>
      <>
        <Input
          placeholder={LL.FullOnboarding.firstName()}
          value={firstName}
          onChangeText={(text) => setFirstName(text)}
        />
        <Input
          placeholder={LL.FullOnboarding.lastName()}
          value={lastName}
          onChangeText={(text) => setLastName(text)}
        />
      </>
      <View style={styles.buttonContainer}>
        <GaloyPrimaryButton
          onPress={confirmNames}
          title={LL.common.next()}
          disabled={!firstName || !lastName}
        />
      </View>
    </Screen>
  )
}

const useStyles = makeStyles(() => ({
  screenStyle: {
    padding: 20,
    flexGrow: 1,
  },

  textStyle: {
    marginBottom: 32,
  },

  buttonContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
}))
