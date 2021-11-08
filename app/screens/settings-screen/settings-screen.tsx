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
import { palette } from "../../theme/palette"
import { LN_PAGE_DOMAIN, WHATSAPP_CONTACT_NUMBER } from "../../constants/support"
import { translate } from "../../i18n"
import { openWhatsApp } from "../../utils/external"
import { resetDataStore } from "../../utils/logout"
import { hasFullPermissions, requestPermission } from "../../utils/notifications"
import KeyStoreWrapper from "../../utils/storage/secureStorage"
import type { ScreenType } from "../../types/jsx"
import type { RootStackParamList } from "../../navigation/stack-param-lists"
import Clipboard from "@react-native-community/clipboard"
import { toastShow } from "../../utils/toast"
import useToken from "../../utils/use-token"
import { MAIN_QUERY } from "../../graphql/query"
import { LANGUAGES } from "./language-screen"

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
    const csvEncoded = data.me?.defaultAccount?.csvTransactions

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

  const me = data?.me || {}

  const defaultWalletId = me.defaultAccount?.wallets?.[0].id

  const [getCsv] = useLazyQuery(
    gql`
      query getWalletCSVTransactions($defaultWalletId: WalletId!) {
        me {
          id
          defaultAccount {
            csvTransactions(walletIds: [$defaultWalletId])
          }
        }
      }
    `,
    { onCompleted: onGetCsvCallback },
  )

  const [notificationsEnabled, setNotificationsEnabled] = React.useState(false)

  React.useEffect(() => {
    ;(async () => {
      setNotificationsEnabled(await hasFullPermissions())
    })()
  }, [])

  return (
    <SettingsScreenJSX
      client={client}
      hasToken={hasToken}
      resetDataStore={() => resetDataStore({ client, removeToken })}
      navigation={navigation}
      username={me.username}
      phone={me.phone}
      language={LANGUAGES[me.language]}
      notifications={
        notificationsEnabled
          ? translate("SettingsScreen.activated")
          : translate("SettingsScreen.activate")
      }
      notificationsEnabled={notificationsEnabled}
      csvAction={() => getCsv({ variables: { defaultWalletId } })}
      securityAction={securityAction}
    />
  )
}

type SettingsScreenProps = {
  client: ApolloClient<unknown>
  hasToken: boolean
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
    hasToken,
    navigation,
    username,
    notificationsEnabled,
    csvAction,
    securityAction,
    resetDataStore,
  } = params
  const copyToClipBoard = (username) => {
    Clipboard.setString(LN_PAGE_DOMAIN + username)
    Clipboard.getString().then((data) =>
      toastShow(translate("tippingLink.copied", { data }), {
        backgroundColor: palette.lightBlue,
      }),
    )
  }

  const list = [
    {
      category: translate("common.phoneNumber"),
      icon: "call",
      id: "phone",
      defaultValue: translate("SettingsScreen.tapLogIn"),
      action: () => navigation.navigate("phoneValidation"),
      enabled: !hasToken,
      greyed: hasToken,
    },
    {
      category: translate("common.username"),
      icon: "ios-person-circle",
      id: "username",
      defaultValue: translate("SettingsScreen.tapUserName"),
      action: () => navigation.navigate("setUsername"),
      enabled: hasToken && !username,
      greyed: !hasToken,
    },
    {
      category: translate("common.language"),
      icon: "ios-language",
      id: "language",
      action: () => navigation.navigate("language"),
      enabled: hasToken,
      greyed: !hasToken,
    },
    {
      category: translate("common.notification"),
      icon: "ios-notifications-circle",
      id: "notifications",
      action: () => hasToken && requestPermission(client),
      enabled: hasToken && notificationsEnabled,
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
      enabled: hasToken,
      greyed: !hasToken,
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
