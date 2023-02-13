import { Screen } from "@app/components/screen"
import { CONTACT_EMAIL_ADDRESS, WHATSAPP_CONTACT_NUMBER } from "@app/config"
import useLogout from "@app/hooks/use-logout"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { openWhatsApp } from "@app/utils/external"
import { StackNavigationProp } from "@react-navigation/stack"
import React from "react"
import { Alert, Linking } from "react-native"
import { SettingsRow } from "./settings-row"
import { gql } from "@apollo/client"
import { useAccountScreenQuery } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"

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

  const { data } = useAccountScreenQuery({ fetchPolicy: "cache-first" })

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
      await openWhatsApp(WHATSAPP_CONTACT_NUMBER, LL.support.deleteAccount())
    } catch (err) {
      // Failed to open whatsapp - trying email
      console.error(err)
      // FIXME email doesn't work on iOS
      Linking.openURL(
        `mailto:${CONTACT_EMAIL_ADDRESS}?subject=${LL.support.deleteAccountEmailSubject({
          phoneNumber: data?.me?.phone || "",
        })}&body=${LL.support.deleteAccount()}`,
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
      category: LL.common.logout(),
      id: "logout",
      icon: "ios-log-out",
      action: () => logoutAction(),
      enabled: isAuthed,
      greyed: !isAuthed,
      hidden: !isAuthed,
    },
    {
      category: LL.SettingsScreen.deleteAccount(),
      id: "delete-account",
      icon: "ios-trash",
      dangerous: true,
      action: () => deleteAccountAction(),
      enabled: isAuthed,
      greyed: !isAuthed,
      hidden: !isAuthed,
    },
  ]
  return (
    <Screen preset="scroll">
      {accountSettingsList.map((setting) => (
        <SettingsRow setting={setting} key={setting.id} />
      ))}
    </Screen>
  )
}
