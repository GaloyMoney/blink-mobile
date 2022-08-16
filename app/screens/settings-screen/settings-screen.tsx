import * as React from "react"
import { Alert, Text, TextStyle } from "react-native"
import Share from "react-native-share"
import { Divider, Icon, ListItem } from "react-native-elements"
import { StackNavigationProp } from "@react-navigation/stack"
import { gql, OperationVariables, QueryLazyOptions, useLazyQuery } from "@apollo/client"
import type { ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet"

import { Screen } from "../../components/screen"
import { VersionComponent } from "../../components/version"
import { palette } from "../../theme/palette"
import { GALOY_PAY_DOMAIN } from "../../constants/support"
import KeyStoreWrapper from "../../utils/storage/secureStorage"
import type { ScreenType } from "../../types/jsx"
import type { RootStackParamList } from "../../navigation/stack-param-lists"
import Clipboard from "@react-native-community/clipboard"
import { toastShow } from "../../utils/toast"
import useToken from "../../hooks/use-token"
import useLogout from "../../hooks/use-logout"
import useMainQuery from "@app/hooks/use-main-query"
import crashlytics from "@react-native-firebase/crashlytics"
import ContactModal from "@app/components/contact-modal/contact-modal"
import { translate } from "@app/utils/translate"
import { copyPaymentInfoToClipboard } from "@app/utils/clipboard"

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "settings">
}

export const SettingsScreen: ScreenType = ({ navigation }: Props) => {
  const { hasToken } = useToken()
  const { logout } = useLogout()

  const { btcWalletId, username, phoneNumber, userPreferredLanguage } = useMainQuery()

  const onGetCsvCallback = async (data) => {
    const csvEncoded = data?.me?.defaultAccount?.csvTransactions
    try {
      await Share.open({
        title: "export-csv-title.csv",
        url: `data:text/comma-separated-values;base64,${csvEncoded}`,
        type: "text/comma-separated-values",
        // subject: 'csv export',
        filename: "export",
        // message: 'export message'
      })
    } catch (err) {
      console.error(err)
    }
  }

  const [fetchCsvTransactions, { loading: loadingCsvTransactions, called, refetch }] =
    useLazyQuery(
      gql`
        query getWalletCSVTransactions($defaultWalletId: WalletId!) {
          me {
            id
            defaultAccount {
              id
              csvTransactions(walletIds: [$defaultWalletId])
            }
          }
        }
      `,
      {
        fetchPolicy: "network-only",
        notifyOnNetworkStatusChange: true,
        onCompleted: onGetCsvCallback,
        onError: (error) => {
          crashlytics().recordError(error)
          Alert.alert(
            translate("common.error"),
            translate("SettingsScreen.csvTransactionsError"),
            [{ text: translate("common.ok") }],
          )
        },
      },
    )

  const securityAction = async () => {
    const isBiometricsEnabled = await KeyStoreWrapper.getIsBiometricsEnabled()
    const isPinEnabled = await KeyStoreWrapper.getIsPinEnabled()

    navigation.navigate("security", {
      mIsBiometricsEnabled: isBiometricsEnabled,
      mIsPinEnabled: isPinEnabled,
    })
  }

  const lnurlAction = () => {
    if (username) {
      navigation.navigate("lnurl", { username })
    } else {
      Alert.alert(
        `Lnurl ${translate("SettingsScreen.title")}`,
        translate("SettingsScreen.lnurlNoUsername"),
        [
          {
            text: translate("Common.yes"),
            onPress: () => navigation.navigate("setUsername"),
          },
          {
            text: translate("Common.no"),
          },
        ],
      )
    }
  }

  const logoutAction = async () => {
    try {
      await logout()
      Alert.alert(translate("common.loggedOut"), "", [
        {
          text: translate("common.ok"),
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

  return (
    <SettingsScreenJSX
      hasToken={hasToken}
      navigation={navigation}
      username={username}
      phone={phoneNumber}
      language={translate(`Languages.${userPreferredLanguage || "DEFAULT"}`)}
      csvAction={() => {
        if (called) {
          refetch({ defaultWalletId: btcWalletId })
        } else {
          fetchCsvTransactions({
            variables: { defaultWalletId: btcWalletId },
          })
        }
      }}
      securityAction={securityAction}
      logoutAction={logoutAction}
      loadingCsvTransactions={loadingCsvTransactions}
      lnurlAction={lnurlAction}
    />
  )
}

type SettingsScreenProps = {
  hasToken: boolean
  navigation: StackNavigationProp<RootStackParamList, "settings">
  username: string
  phone: string
  language: string
  notificationsEnabled: boolean
  csvAction: (options?: QueryLazyOptions<OperationVariables>) => void
  securityAction: () => void
  logoutAction: () => Promise<void>
  lnurlAction: () => void
  loadingCsvTransactions: boolean
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
  greyed?: boolean
  styleDivider?: ViewStyleProp
}

export const SettingsScreenJSX: ScreenType = (params: SettingsScreenProps) => {
  const [isContactModalVisible, setIsContactModalVisible] = React.useState(false)
  const {
    hasToken,
    navigation,
    username,
    phone,
    language,
    csvAction,
    securityAction,
    logoutAction,
    lnurlAction,
    loadingCsvTransactions,
  } = params
  const copyToClipBoard = (username) => {
    copyPaymentInfoToClipboard(GALOY_PAY_DOMAIN + username)
    Clipboard.getString().then((data) =>
      toastShow({ message: translate("tippingLink.copied", { data }), type: "success" }),
    )
  }

  const toggleIsContactModalVisible = () => {
    setIsContactModalVisible(!isContactModalVisible)
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
      category: translate("common.security"),
      icon: "lock-closed-outline",
      id: "security",
      action: securityAction,
      enabled: hasToken,
      greyed: !hasToken,
    },
    {
      category: "lnurl",
      icon: "ios-globe",
      id: "lnurl",
      action: lnurlAction,
      enabled: hasToken,
      greyed: !hasToken || !username,
    },
    {
      category: translate("common.csvExport"),
      icon: "ios-download",
      id: "csv",
      action: () => csvAction(),
      enabled: hasToken && !loadingCsvTransactions,
      greyed: !hasToken || loadingCsvTransactions,
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
      category: translate("support.contactUs"),
      icon: "help-circle",
      id: "contact-us",
      action: toggleIsContactModalVisible,
      enabled: true,
      greyed: false,
      styleDivider: { backgroundColor: palette.lighterGrey, height: 18 },
    },
    {
      category: translate("common.logout"),
      id: "logout",
      icon: "ios-log-out",
      action: () => logoutAction(),
      enabled: hasToken,
      greyed: !hasToken,
      hidden: !hasToken,
    },
  ]

  return (
    <Screen preset="scroll">
      {settingList.map((setting, i) => {
        if (setting.hidden) {
          return null
        }
        const settingColor = setting.greyed ? palette.midGrey : palette.darkGrey
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
                    <Text>{setting.subTitleText}</Text>
                  </ListItem.Subtitle>
                )}
              </ListItem.Content>
              {setting.enabled && <ListItem.Chevron />}
            </ListItem>
            <Divider style={setting.styleDivider} />
          </React.Fragment>
        )
      })}
      <VersionComponent />
      <ContactModal
        isVisble={isContactModalVisible}
        toggleModal={toggleIsContactModalVisible}
      />
    </Screen>
  )
}
