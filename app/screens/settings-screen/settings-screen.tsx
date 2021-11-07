import * as React from "react"
import { Alert, Text } from "react-native"
import Share from "react-native-share"
import { Divider, Icon, ListItem, Switch } from "react-native-elements"
import { StackNavigationProp } from "@react-navigation/stack"
import {
  ApolloClient,
  gql,
  OperationVariables,
  QueryLazyOptions,
  useApolloClient,
  useLazyQuery,
  useQuery,
} from "@apollo/client"
import type { ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet"

import { Screen } from "../../components/screen"
import { VersionComponent } from "../../components/version"
import { palette } from "../../theme/palette"
import { LN_PAGE_DOMAIN, WHATSAPP_CONTACT_NUMBER } from "../../constants/support"
import { translate } from "../../i18n"
import { openWhatsApp } from "../../utils/external"
import { resetDataStore } from "../../utils/logout"
import {
  enableAllNotifications,
  disableAllNotifications,
} from "../../utils/notifications"
import KeyStoreWrapper from "../../utils/storage/secureStorage"
import type { ScreenType } from "../../types/jsx"
import type { RootStackParamList } from "../../navigation/stack-param-lists"
import Clipboard from "@react-native-community/clipboard"
import { toastShow } from "../../utils/toast"
import useToken from "../../utils/use-token"
import { MAIN_QUERY } from "../../graphql/query"
import { LANGUAGES } from "./language-screen"
import { TextStyle } from "react-native-phone-input"

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "settings">
}

export const SettingsScreen: ScreenType = ({ navigation }: Props) => {
  const client = useApolloClient()
  const { hasToken, removeToken } = useToken()

  const { data } = useQuery(MAIN_QUERY, {
    variables: { hasToken },
    fetchPolicy: "cache-only",
  })

  const securityAction = async () => {
    const isBiometricsEnabled = await KeyStoreWrapper.getIsBiometricsEnabled()
    const isPinEnabled = await KeyStoreWrapper.getIsPinEnabled()

    navigation.navigate("security", {
      mIsBiometricsEnabled: isBiometricsEnabled,
      mIsPinEnabled: isPinEnabled,
    })
  }

  const onGetCsvCallback = async (data) => {
    const csvEncoded = data.wallet[0].csv
    try {
      await Share.open({
        // title: "export-csv-title.csv",
        url: `data:text/csv;base64,${csvEncoded}`,
        type: "text/csv",
        // subject: 'csv export',
        filename: "export.csv",
        // message: 'export message'
      })
    } catch (err) {
      console.error(err)
    }
  }

  const [getCsv] = useLazyQuery(
    gql`
      query csv {
        wallet {
          id
          csv
        }
      }
    `,
    { onCompleted: onGetCsvCallback },
  )

  const me = data?.me || {}

  return (
    <SettingsScreenJSX
      client={client}
      csvAction={getCsv}
      hasToken={hasToken}
      language={LANGUAGES[me.language]}
      navigation={navigation}
      enabledNotifications={me.enabledNotifications}
      phone={me.phone}
      resetDataStore={() => resetDataStore({ client, removeToken })}
      securityAction={securityAction}
      username={me.username}
    />
  )
}

type SettingsScreenProps = {
  client: ApolloClient<unknown>
  csvAction: (options?: QueryLazyOptions<OperationVariables>) => void
  enableNotifications: () => void
  disableNotifications: () => void
  hasToken: boolean
  language: string
  navigation: StackNavigationProp<RootStackParamList, "settings">
  enabledNotifications: string[]
  phone: string
  resetDataStore: () => Promise<void>
  securityAction: () => void
  username: string
}

type SettingRow = {
  id: string
  icon: string
  category: string
  hidden?: boolean
  enabled?: boolean
  subTitleText?: string
  subTitleDefaultValue?: string
  action?: () => void
  actionSwitch?: React.ComponentElement<any, any>
  greyed?: boolean
  styleDivider?: ViewStyleProp
}

export const SettingsScreenJSX: ScreenType = ({
  client,
  csvAction,
  hasToken,
  language,
  navigation,
  enabledNotifications,
  phone,
  resetDataStore,
  securityAction,
  username,
}: SettingsScreenProps) => {
  const [notificationSwitchValue, setNotificationSwitchValue] = React.useState(() =>
    enabledNotifications?.includes("ALL_NOTIFICATIONS"),
  )
  const copyToClipBoard = (username) => {
    Clipboard.setString(LN_PAGE_DOMAIN + username)
    Clipboard.getString().then((data) =>
      toastShow(translate("tippingLink.copied", { data }), {
        backgroundColor: palette.lightBlue,
      }),
    )
  }

  const openWhatsAppAction = () =>
    openWhatsApp(WHATSAPP_CONTACT_NUMBER, translate("whatsapp.defaultSupportMessage"))

  const logoutAction = async () => {
    console.log("logout")

    await resetDataStore()
    Alert.alert(translate("common.loggedOut"), "", [
      {
        text: translate("common.ok"),
        onPress: () => {
          navigation.goBack()
        },
      },
    ])
  }

  const notificationsAction = (switchValue) => {
    setNotificationSwitchValue(switchValue)
    try {
      if (switchValue) {
        enableAllNotifications(client)
      } else {
        disableAllNotifications(client)
      }
    } catch (err) {
      console.log("Error changing notifications")
      setNotificationSwitchValue(!switchValue)
    }
  }

  const settingList: SettingRow[] = [
    {
      category: translate("common.phoneNumber"),
      icon: "call",
      id: "phone",
      subTitleDefaultValue: translate("SettingsScreen.tapLogIn"),
      subTitleText: phone,
      action: () => navigation.navigate("phoneValidation"),
      enabled: !hasToken,
      greyed: hasToken,
    },
    {
      category: translate("common.username"),
      icon: "ios-person-circle",
      id: "username",
      subTitleDefaultValue: translate("SettingsScreen.tapUserName"),
      subTitleText: username,
      action: () => navigation.navigate("setUsername"),
      enabled: hasToken && !username,
      greyed: !hasToken,
    },
    {
      category: translate("common.language"),
      icon: "ios-language",
      id: "language",
      subTitleText: language,
      action: () => navigation.navigate("language"),
      enabled: hasToken,
      greyed: !hasToken,
    },
    {
      category: translate("common.notifications"),
      icon: "ios-notifications-circle",
      id: "notifications",
      actionSwitch: (
        <Switch
          disabled={!hasToken}
          value={notificationSwitchValue}
          onValueChange={notificationsAction}
          color="orange"
        />
      ),
      greyed: !hasToken,
    },
    {
      category: translate("common.security"),
      icon: "lock-closed-outline",
      id: "security",
      action: securityAction,
      enabled: hasToken,
      greyed: !hasToken,
    },
    {
      category: translate("common.csvExport"),
      icon: "ios-download",
      id: "csv",
      action: () => csvAction(),
      enabled: hasToken,
      greyed: !hasToken,
    },
    {
      category: translate("tippingLink.title"),
      icon: "cash-outline",
      id: "tippingLink",
      action: () => copyToClipBoard(username),
      enabled: hasToken && username !== null,
      greyed: !hasToken || username === null,
    },
    {
      category: translate("whatsapp.contactUs"),
      icon: "ios-logo-whatsapp",
      id: "contact-us",
      action: openWhatsAppAction,
      enabled: true,
      greyed: false,
      styleDivider: { backgroundColor: palette.lighterGrey, height: 18 },
    },
    {
      category: translate("common.logout"),
      id: "logout",
      icon: "ios-log-out",
      action: logoutAction,
      enabled: true,
      hidden: !hasToken,
      greyed: !hasToken,
    },
  ]

  return (
    <Screen preset="scroll">
      {settingList.map((setting, i) => {
        if (setting.hidden) {
          return null
        }
        const settingColor = setting.greyed ? palette.midGrey : null
        const settingStyle: TextStyle = { color: settingColor }

        return (
          <React.Fragment key={`setting-option-${i}`}>
            <ListItem onPress={setting.action} disabled={!setting.enabled}>
              <Icon name={setting.icon} type="ionicon" color={settingColor} />
              <ListItem.Content>
                <ListItem.Title style={settingStyle}>
                  <Text>{setting.category}</Text>
                </ListItem.Title>
                {setting.subTitleText && (
                  <ListItem.Subtitle style={settingStyle}>
                    {setting.subTitleText}
                  </ListItem.Subtitle>
                )}
              </ListItem.Content>
              {setting.actionSwitch}
              {setting.enabled && <ListItem.Chevron />}
            </ListItem>
            <Divider style={setting.styleDivider} />
          </React.Fragment>
        )
      })}
      <VersionComponent />
    </Screen>
  )
}
