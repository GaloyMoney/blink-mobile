import { Screen } from "@app/components/screen"
import useLogout from "@app/hooks/use-logout"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { StackNavigationProp } from "@react-navigation/stack"
import React from "react"
import { Alert } from "react-native"
import { SettingsRow } from "./settings-row"
import { gql } from "@apollo/client"
import { useAccountScreenQuery } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useLevel } from "@app/graphql/level-context"

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
      category: isAtLeastLevelZero
        ? LL.AccountScreen.upgrade()
        : LL.AccountScreen.logIn(),
      id: "login",
      icon: "ios-log-in",
      action: () => navigation.navigate("phoneFlow"),
      enabled: isAuthed,
      greyed: !isAuthed,
      hidden: !isAuthed,
    },
    {
      category: LL.AccountScreen.logOutAndDeleteLocalData(),
      id: "logout",
      icon: "ios-log-out",
      dangerous: true,
      action: logoutAlert,
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
