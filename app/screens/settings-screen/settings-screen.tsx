import * as React from "react"
import { Alert, View } from "react-native"
import Share from "react-native-share"
import { Divider, Icon, ListItem } from "react-native-elements"
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
import { language_mapping } from "./language-screen"
import { palette } from "../../theme/palette"
import { WHATSAPP_CONTACT_NUMBER } from "../../constants/support"
import { translate } from "../../i18n"
import { walletIsActive } from "../../graphql/query"
import { openWhatsApp } from "../../utils/external"
import { resetDataStore } from "../../utils/logout"
import { hasFullPermissions, requestPermission } from "../../utils/notifications"
import KeyStoreWrapper from "../../utils/storage/secureStorage"
import type { ScreenType } from "../../types/jsx"
import type { RootStackParamList } from "../../navigation/stack-param-lists"

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "settings">
}

type ComponentProps = {
  icon: string
  category: string
  id: string
  i: number
  enabled: boolean
  greyed: boolean
  defaultValue?: string
  action: () => void
  styleDivider?: ViewStyleProp
}

export const SettingsScreen: ScreenType = ({ navigation }: Props) => {
  const client = useApolloClient()

  const { data } = useQuery(
    gql`
      query me_settings {
        me {
          username
          phone
          language
        }
      }
    `,
    { fetchPolicy: "cache-only" },
  )

  const securityAction = async () => {
    const isBiometricsEnabled = await KeyStoreWrapper.getIsBiometricsEnabled()
    const isPinEnabled = await KeyStoreWrapper.getIsPinEnabled()

    navigation.navigate("security", {
      mIsBiometricsEnabled: isBiometricsEnabled,
      mIsPinEnabled: isPinEnabled,
    })
  }

  const onGetCsvCallback = async (data) => {
    console.log({ data }, "result getCsv")
    const csvEncoded = data.wallet[0].csv
    try {
      console.log({ csvEncoded })
      // const decoded = Buffer.from(csvEncoded, 'base64').toString('ascii')
      // console.log({decoded})

      await Share.open({
        // title: "export-csv-title.csv",
        url: `data:text/csv;base64,${csvEncoded}`,
        type: "text/csv",
        // subject: 'csv export',
        filename: "export.csv",
        // message: 'export message'
      })
    } catch (err) {
      console.error({ err }, "export export CSV")
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

  const [notificationsEnabled, setNotificationsEnabled] = React.useState(false)

  React.useEffect(() => {
    ;(async () => {
      setNotificationsEnabled(await hasFullPermissions())
    })()
  }, [])

  return (
    <SettingsScreenJSX
      client={client}
      walletIsActive={walletIsActive(client)}
      resetDataStore={() => resetDataStore(client)}
      navigation={navigation}
      username={me.username}
      phone={me.phone}
      language={language_mapping[me.language]}
      notifications={
        notificationsEnabled
          ? translate("SettingsScreen.activated")
          : translate("SettingsScreen.activate")
      }
      notificationsEnabled={notificationsEnabled}
      csvAction={getCsv}
      securityAction={securityAction}
    />
  )
}

type SettingsScreenProps = {
  client: ApolloClient<unknown>
  walletIsActive: boolean
  navigation: StackNavigationProp<RootStackParamList, "settings">
  username: string
  notificationsEnabled: boolean
  csvAction: (options?: QueryLazyOptions<OperationVariables>) => void
  securityAction: () => void
  resetDataStore: () => Promise<void>
}

export const SettingsScreenJSX: ScreenType = (params: SettingsScreenProps) => {
  const {
    client,
    walletIsActive,
    navigation,
    username,
    notificationsEnabled,
    csvAction,
    securityAction,
    resetDataStore,
  } = params

  const list = [
    {
      category: translate("common.phoneNumber"),
      icon: "call",
      id: "phone",
      defaultValue: translate("SettingsScreen.tapLogIn"),
      action: () => navigation.navigate("phoneValidation"),
      enabled: !walletIsActive,
      greyed: walletIsActive,
    },
    {
      category: translate("common.username"),
      icon: "ios-person-circle",
      id: "username",
      defaultValue: translate("SettingsScreen.tapUserName"),
      action: () => navigation.navigate("setUsername"),
      enabled: walletIsActive && !username,
      greyed: !walletIsActive,
    },
    {
      category: translate("common.language"),
      icon: "ios-language",
      id: "language",
      action: () => navigation.navigate("language"),
      enabled: walletIsActive,
      greyed: !walletIsActive,
    },
    {
      category: translate("common.notification"),
      icon: "ios-notifications-circle",
      id: "notifications",
      action: () => requestPermission(client),
      enabled: walletIsActive && notificationsEnabled,
      greyed: !walletIsActive,
    },
    {
      category: translate("common.security"),
      icon: "lock-closed-outline",
      id: "security",
      action: securityAction,
      enabled: walletIsActive,
      greyed: !walletIsActive,
    },
    {
      category: translate("common.csvExport"),
      icon: "ios-download",
      id: "csv",
      action: () => csvAction(),
      enabled: walletIsActive,
      greyed: !walletIsActive,
    },
    {
      category: translate("whatsapp.contactUs"),
      icon: "ios-logo-whatsapp",
      id: "contact-us",
      action: () =>
        openWhatsApp(
          WHATSAPP_CONTACT_NUMBER,
          translate("whatsapp.defaultSupportMessage"),
        ),
      enabled: true,
      greyed: false,
      styleDivider: { backgroundColor: palette.lighterGrey, height: 18 },
    },
    {
      category: translate("common.logout"),
      id: "logout",
      icon: "ios-log-out",
      action: async () => {
        await resetDataStore()
        Alert.alert(translate("common.loggedOut"), "", [
          {
            text: translate("common.ok"),
            onPress: () => {
              navigation.goBack()
            },
          },
        ])
      },
      enabled: walletIsActive,
      greyed: !walletIsActive,
    },
  ]

  const Component = ({
    icon,
    category,
    id,
    i,
    enabled,
    greyed,
    defaultValue = undefined,
    action,
    styleDivider,
  }: ComponentProps) => {
    const value = params[id] || defaultValue

    return (
      <>
        <ListItem key={`setting-option-${i}`} onPress={action} disabled={!enabled}>
          <Icon name={icon} type="ionicon" color={greyed ? palette.midGrey : null} />
          <ListItem.Content>
            <View>
              <ListItem.Title style={greyed ? { color: palette.midGrey } : {}}>
                {category}
              </ListItem.Title>
              {value && (
                <ListItem.Title style={greyed ? { color: palette.midGrey } : {}}>
                  {value}
                </ListItem.Title>
              )}
            </View>
          </ListItem.Content>
          {enabled && <ListItem.Chevron />}
        </ListItem>
        <Divider style={styleDivider} />
      </>
    )
  }

  return (
    <Screen preset="scroll">
      {list.map((item, i) => (
        <Component {...item} i={i} key={i} />
      ))}
      <VersionComponent />
    </Screen>
  )
}
