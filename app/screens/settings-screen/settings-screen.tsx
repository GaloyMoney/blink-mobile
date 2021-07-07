import * as React from "react"
import { Alert, View } from "react-native"
import Share from "react-native-share"
import EStyleSheet from "react-native-extended-stylesheet"
import { Divider, Icon, ListItem } from "react-native-elements"
import { gql, useApolloClient, useLazyQuery, useQuery } from "@apollo/client"

// Components
import { Screen } from "../../components/screen"
import { VersionComponent } from "../../components/version"

// Constants
import { language_mapping } from "./language-screen"
import { palette } from "../../theme/palette"
import {
  WHATSAPP_CONTACT_NUMBER,
  WHATSAPP_DEFAULT_CONTACT_MESSAGE,
} from "../../constants/support"

// Functions
import { translate } from "../../i18n"
import { walletIsActive } from "../../graphql/query"

// Utils
import { openWhatsApp } from "../../utils/external"
import { resetDataStore } from "../../utils/logout"
import { hasFullPermissions, requestPermission } from "../../utils/notifications"

// Types
import type { ScreenType } from "../../types/screen"

type Props = {
  navigation: Record<string, any>
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
  styleDivider?: Record<string, any>
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

  const onGetCsvCallback = async (data) => {
    console.log({ data }, "result getCsv")
    const csvEncoded = data.wallet[0].csv
    try {
      console.log({ csvEncoded })
      // const decoded = Buffer.from(csvEncoded, 'base64').toString('ascii')
      // console.log({decoded})

      const shareResponse = await Share.open({
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
    />
  )
}

export const SettingsScreenJSX = (params) => {
  const {
    client,
    walletIsActive,
    navigation,
    username,
    notificationsEnabled,
    csvAction,
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
      category: translate("common.csvExport"),
      icon: "ios-download",
      id: "csv",
      action: () => csvAction(),
      enabled: walletIsActive,
      greyed: !walletIsActive,
    },
    {
      category: translate("common.contactUs"),
      icon: "ios-logo-whatsapp",
      id: "contact-us",
      action: () =>
        openWhatsApp(WHATSAPP_CONTACT_NUMBER, WHATSAPP_DEFAULT_CONTACT_MESSAGE),
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
        Alert.alert("you have been logged out", "", [
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
