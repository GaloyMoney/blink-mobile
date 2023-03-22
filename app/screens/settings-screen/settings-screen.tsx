import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import Share from "react-native-share"

import { Screen } from "../../components/screen"
import { VersionComponent } from "../../components/version"
import type { RootStackParamList } from "../../navigation/stack-param-lists"
import { palette } from "../../theme/palette"
import KeyStoreWrapper from "../../utils/storage/secureStorage"

import ContactModal from "@app/components/contact-modal/contact-modal"
import crashlytics from "@react-native-firebase/crashlytics"

import { gql } from "@apollo/client"
import {
  useSettingsScreenQuery,
  useWalletCsvTransactionsLazyQuery,
} from "@app/graphql/generated"
import { useAppConfig } from "@app/hooks"
import { useI18nContext } from "@app/i18n/i18n-react"
import { SettingsRow } from "./settings-row"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { getLanguageFromString } from "@app/utils/locale-detector"
import { useNavigation } from "@react-navigation/native"
import Clipboard from "@react-native-clipboard/clipboard"
import { getLightningAddress } from "@app/utils/pay-links"
import { toastShow } from "@app/utils/toast"

import { useDisplayCurrency } from "@app/hooks/use-display-currency"

import TicketModal from "@app/components/ticket-modal/ticket-modal"

gql`
  query walletCSVTransactions($walletIds: [WalletId!]!) {
    me {
      id
      defaultAccount {
        id
        csvTransactions(walletIds: $walletIds)
      }
    }
  }

  query settingsScreen {
    me {
      id
      phone
      username
      language
      defaultAccount {
        id
        btcWallet @client {
          id
        }
        usdWallet @client {
          id
        }
      }
    }
  }
`

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, "settings">>()

  const { appConfig } = useAppConfig()
  const { name: bankName } = appConfig.galoyInstance
  // const uri = "https://github.com/GaloyMoney/galoy-mobile/issues"

  const isAuthed = useIsAuthed()
  const { LL } = useI18nContext()

  const { data } = useSettingsScreenQuery({
    fetchPolicy: "cache-first",
    returnPartialData: true,
    skip: !isAuthed,
  })

  const { displayCurrency } = useDisplayCurrency()

  const username = data?.me?.username ?? undefined
  const phone = data?.me?.phone ?? undefined
  const language = getLanguageFromString(data?.me?.language)

  const btcWalletId = data?.me?.defaultAccount?.btcWallet?.id
  const usdWalletId = data?.me?.defaultAccount?.usdWallet?.id
  const lightningAddress = username
    ? getLightningAddress(appConfig.galoyInstance, username)
    : ""

  const [fetchCsvTransactionsQuery, { loading: loadingCsvTransactions }] =
    useWalletCsvTransactionsLazyQuery({
      fetchPolicy: "no-cache",
    })

  const fetchCsvTransactions = async () => {
    const walletIds: string[] = []
    if (btcWalletId) walletIds.push(btcWalletId)
    if (usdWalletId) walletIds.push(usdWalletId)

    const { data } = await fetchCsvTransactionsQuery({
      variables: { walletIds },
    })

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
    } catch (err: unknown) {
      if (err instanceof Error) {
        crashlytics().recordError(err)
      }
      console.error(err)
    }
  }

  const securityAction = async () => {
    const isBiometricsEnabled = await KeyStoreWrapper.getIsBiometricsEnabled()
    const isPinEnabled = await KeyStoreWrapper.getIsPinEnabled()

    navigation.navigate("security", {
      mIsBiometricsEnabled: isBiometricsEnabled,
      mIsPinEnabled: isPinEnabled,
    })
  }

  const [isContactModalVisible, setIsContactModalVisible] = React.useState(false)
  const [isTicketModalVisible, setIsTicketModalVisible] = React.useState(false)

  const toggleIsContactModalVisible = () => {
    setIsContactModalVisible(!isContactModalVisible)
  }
  const toggleIsTicketModalVisible = () => {
    setIsTicketModalVisible(!isTicketModalVisible)
  }

  const settingsList: SettingRow[] = [
    {
      category: LL.common.phoneNumber(),
      icon: "call",
      id: "phone",
      subTitleDefaultValue: LL.SettingsScreen.tapLogIn(),
      subTitleText: phone,
      action: () => navigation.navigate("phoneFlow"),
      enabled: !isAuthed,
      greyed: isAuthed,
    },
    {
      category: LL.GaloyAddressScreen.yourAddress({ bankName }),
      icon: "person",
      id: "username",
      subTitleDefaultValue: LL.SettingsScreen.tapUserName(),
      subTitleText: lightningAddress,
      action: () => {
        if (!lightningAddress) {
          navigation.navigate("addressScreen")
          return
        }
        Clipboard.setString(lightningAddress)
        toastShow({
          message: (translations) =>
            translations.GaloyAddressScreen.copiedAddressToClipboard({
              bankName,
            }),
          type: "success",
          currentTranslation: LL,
        })
      },
      enabled: isAuthed,
      greyed: !isAuthed,
    },
    {
      category: LL.SettingsScreen.addressScreen({ bankName }),
      icon: "custom-receive-bitcoin",
      id: "address",
      action: () => navigation.navigate("addressScreen"),
      enabled: isAuthed && Boolean(lightningAddress),
      greyed: !isAuthed || !lightningAddress,
    },
    {
      category: LL.common.transactionLimits(),
      id: "limits",
      icon: "custom-info-icon",
      action: () => navigation.navigate("transactionLimitsScreen"),
      enabled: isAuthed,
      greyed: !isAuthed,
    },
    {
      category: LL.common.language(),
      icon: "ios-language",
      id: "language",
      subTitleText: language,
      action: () => navigation.navigate("language"),
      enabled: isAuthed,
      greyed: !isAuthed,
    },
    {
      category: `${LL.common.currency()} - beta`,
      icon: "ios-cash",
      id: "currency",
      action: () => navigation.navigate("currency"),
      subTitleText: displayCurrency,
      enabled: isAuthed,
      greyed: !isAuthed,
    },
    {
      category: LL.common.security(),
      icon: "lock-closed-outline",
      id: "security",
      action: securityAction,
      enabled: isAuthed,
      greyed: !isAuthed,
    },
    {
      category: LL.common.csvExport(),
      icon: "ios-download",
      id: "csv",
      action: fetchCsvTransactions,
      enabled: isAuthed && !loadingCsvTransactions,
      greyed: !isAuthed || loadingCsvTransactions,
    },
    {
      category: LL.common.account(),
      icon: "person-outline",
      id: "account",
      action: () => navigation.navigate("accountScreen"),
      enabled: isAuthed,
      greyed: !isAuthed,
      // styleDivider: { backgroundColor: palette.lighterGrey, height: 18 },
    },
    {
      category: LL.support.ticket(),
      icon: "warning",
      id: "ticket",
      action: toggleIsTicketModalVisible,
      enabled: true,
      greyed: false,
      styleDivider: { backgroundColor: palette.lighterGrey, height: 4 },
    },
    {
      category: LL.support.contactUs(),
      icon: "help-circle",
      id: "contact-us",
      action: toggleIsContactModalVisible,
      enabled: true,
      greyed: false,
    },
  ]

  return (
    <Screen preset="scroll">
      {settingsList.map((setting) => (
        <SettingsRow setting={setting} key={setting?.id} />
      ))}
      <VersionComponent />
      <TicketModal
        isVisible={isTicketModalVisible}
        toggleModal={toggleIsTicketModalVisible}
      />
      <ContactModal
        isVisible={isContactModalVisible}
        toggleModal={toggleIsContactModalVisible}
      />
    </Screen>
  )
}
