import { Screen } from "@app/components/screen"
import useLogout from "@app/hooks/use-logout"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { StackNavigationProp } from "@react-navigation/stack"
import React from "react"
import { Alert, Linking } from "react-native"
import { SettingsRow } from "./settings-row"
import { gql } from "@apollo/client"
import { useAccountScreenQuery } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useLevel } from "@app/graphql/level-context"
import { CONTACT_EMAIL_ADDRESS, WHATSAPP_CONTACT_NUMBER } from "@app/config"
import { openWhatsApp } from "@app/utils/external"
import { isIos } from "@app/utils/helper"

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "accountScreen">
}

gql`
  query accountScreen {
    me {
      id
      phone
    }
  }
`

export const AccountScreen = ({ navigation }: Props) => {
  const isAuthed = useIsAuthed()
  const { logout } = useLogout()
  const { LL } = useI18nContext()

  const { isAtLeastLevelZero, currentLevel } = useLevel()

  const { data } = useAccountScreenQuery({ fetchPolicy: "cache-first", skip: !isAuthed })
  const phoneNumber = data?.me?.phone || "unknown"

  const logoutAlert = () =>
    Alert.alert(
      LL.AccountScreen.logoutAlertTitle(),
      LL.AccountScreen.logoutAlertContent({ phoneNumber }),
      [
        {
          text: LL.common.cancel(),
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: LL.AccountScreen.IUnderstand(),
          onPress: logoutAction,
        },
      ],
    )

  const logoutAction = async () => {
    try {
      await logout()
      Alert.alert(LL.common.loggedOut(), "", [
        {
          text: LL.common.ok(),
          onPress: () => {
            navigation.goBack()
          },
        },
      ])
    } catch (err) {
      // TODO: figure out why ListItem onPress is swallowing errors
      console.error(err)
    }
  }

  const deleteAccountAction = async () => {
    try {
      await openWhatsApp(
        WHATSAPP_CONTACT_NUMBER,
        LL.support.deleteAccountFromPhone({ phoneNumber }),
      )
    } catch (err) {
      console.error(err, "Failed to open WhatsApp")

      Linking.openURL(
        `mailto:${CONTACT_EMAIL_ADDRESS}?subject=${encodeURIComponent(
          LL.support.deleteAccount(),
        )}&body=${encodeURIComponent(
          LL.support.deleteAccountFromPhone({
            phoneNumber,
          }),
        )}`,
      ).catch((err) => {
        // Email also failed to open.  Displaying alert.
        console.error(err)
        Alert.alert(LL.common.error(), LL.errors.problemPersists(), [
          { text: LL.common.ok() },
        ])
      })
    }
  }

  const accountSettingsList: SettingRow[] = [
    {
      category: LL.AccountScreen.accountLevel(),
      id: "level",
      icon: "ios-flash",
      subTitleText: currentLevel,
      enabled: false,
      greyed: false,
    },
    {
      category: LL.common.transactionLimits(),
      id: "limits",
      icon: "custom-info-icon",
      action: () => navigation.navigate("transactionLimitsScreen"),
      enabled: isAtLeastLevelZero,
      greyed: !isAtLeastLevelZero,
    },
    {
      category: LL.AccountScreen.logOutAndDeleteLocalData(),
      id: "logout",
      icon: "ios-log-out",
      action: logoutAlert,
      enabled: isAuthed,
      greyed: !isAuthed,
      hidden: !isAuthed,
    },
  ]

  if (isIos) {
    accountSettingsList.push({
      category: LL.support.deleteAccount(),
      id: "deleteAccount",
      icon: "close-circle-outline",
      dangerous: true,
      action: deleteAccountAction,
      enabled: isAuthed,
      greyed: !isAuthed,
      hidden: !isAuthed,
    })
  }

  return (
    <Screen preset="scroll">
      {accountSettingsList.map((setting) => (
        <SettingsRow setting={setting} key={setting.id} />
      ))}
    </Screen>
  )
}
