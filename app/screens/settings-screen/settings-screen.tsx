import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import Share from "react-native-share"

import { Screen } from "../../components/screen"
import { VersionComponent } from "../../components/version"
import type { RootStackParamList } from "../../navigation/stack-param-lists"
import KeyStoreWrapper from "../../utils/storage/secureStorage"

import ContactModal from "@app/components/contact-modal/contact-modal"
import crashlytics from "@react-native-firebase/crashlytics"

import { gql } from "@apollo/client"
import {
  useSettingsScreenQuery,
  useWalletCsvTransactionsLazyQuery,
} from "@app/graphql/generated"
import { useAppConfig } from "@app/hooks"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { useI18nContext } from "@app/i18n/i18n-react"
import { getLanguageFromString } from "@app/utils/locale-detector"
import { getLightningAddress } from "@app/utils/pay-links"
import { toastShow } from "@app/utils/toast"
import Clipboard from "@react-native-clipboard/clipboard"
import { useNavigation } from "@react-navigation/native"
import { SettingsRow } from "./settings-row"
import { getReadableVersion } from "react-native-device-info"
import { isIos } from "@app/utils/helper"
import Rate from "react-native-rate"
import { ratingOptions } from "@app/config"
import { useLevel } from "@app/graphql/level-context"

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
        defaultWalletId
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

  const { isAtLeastLevelZero, isAtLeastLevelOne } = useLevel()
  const { LL } = useI18nContext()

  const { data } = useSettingsScreenQuery({
    fetchPolicy: "cache-first",
    returnPartialData: true,
    skip: !isAtLeastLevelZero,
  })

  const { displayCurrency } = useDisplayCurrency()

  const username = data?.me?.username ?? undefined
  const phone = data?.me?.phone ?? undefined
  const language = getLanguageFromString(data?.me?.language)

  const btcWalletId = data?.me?.defaultAccount?.btcWallet?.id
  const usdWalletId = data?.me?.defaultAccount?.usdWallet?.id
  const defaultWalletId = data?.me?.defaultAccount?.defaultWalletId
  const defaultWalletCurrency = defaultWalletId === btcWalletId ? "BTC" : "Stablesats USD"

  const lightningAddress = username
    ? getLightningAddress(appConfig.galoyInstance.lnAddressHostname, username)
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
  const toggleIsContactModalVisible = () => {
    setIsContactModalVisible(!isContactModalVisible)
  }

  const rateUs = () => {
    Rate.rate(ratingOptions, (success, errorMessage) => {
      if (success) {
        crashlytics().log("User went to the review page")
      }
      if (errorMessage) {
        crashlytics().recordError(new Error(errorMessage))
      }
    })
  }

  const contactMessageBody = LL.support.defaultSupportMessage({
    os: isIos ? "iOS" : "Android",
    version: getReadableVersion(),
    bankName,
  })

  const contactMessageSubject = LL.support.defaultEmailSubject({
    bankName,
  })

  const settingsList: SettingRow[] = [
    {
      category: isAtLeastLevelOne
        ? LL.common.phoneNumber()
        : LL.GetStartedScreen.logInCreateAccount(),
      icon: "call",
      id: "phone",

      // FIXME: this is not shown
      subTitleDefaultValue: LL.SettingsScreen.tapLogIn(),

      subTitleText: phone,
      action: () => navigation.navigate("phoneFlow"),
      enabled: !isAtLeastLevelOne,
      greyed: isAtLeastLevelOne,
    },
    {
      category: LL.GaloyAddressScreen.yourAddress({ bankName }),
      icon: "person-outline",
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
      chevronLogo: lightningAddress ? "copy" : undefined,
      enabled: isAtLeastLevelOne,
      greyed: !isAtLeastLevelOne,
    },
    {
      category: LL.SettingsScreen.addressScreen(),
      icon: "custom-receive-bitcoin",
      id: "address",
      action: () => navigation.navigate("addressScreen"),
      enabled: isAtLeastLevelOne && Boolean(lightningAddress),
      greyed: !isAtLeastLevelOne || !lightningAddress,
    },
    {
      category: LL.common.language(),
      icon: "ios-language",
      id: "language",
      subTitleText: language,
      action: () => navigation.navigate("language"),
      enabled: isAtLeastLevelZero,
      greyed: !isAtLeastLevelZero,
    },
    {
      category: `${LL.common.currency()} - beta`,
      icon: "ios-cash",
      id: "currency",
      action: () => navigation.navigate("currency"),
      subTitleText: displayCurrency,
      enabled: isAtLeastLevelZero,
      greyed: !isAtLeastLevelZero,
    },
    {
      category: `${LL.SettingsScreen.defaultWallet()}`,
      icon: "wallet-outline",
      id: "default-wallet",
      action: () => navigation.navigate("defaultWallet"),
      subTitleText: defaultWalletCurrency,
      enabled: isAtLeastLevelZero,
      greyed: !isAtLeastLevelZero,
    },
    {
      category: LL.common.security(),
      icon: "lock-closed-outline",
      id: "security",
      action: securityAction,
      enabled: isAtLeastLevelZero,
      greyed: !isAtLeastLevelZero,
    },
    {
      category: LL.common.csvExport(),
      icon: "ios-download",
      id: "csv",
      action: fetchCsvTransactions,
      enabled: isAtLeastLevelZero && !loadingCsvTransactions,
      greyed: !isAtLeastLevelZero || loadingCsvTransactions,
    },
    {
      category: LL.common.account(),
      icon: "person-outline",
      id: "account",
      action: () => navigation.navigate("accountScreen"),
      enabled: isAtLeastLevelZero,
      greyed: !isAtLeastLevelZero,
      styleDivider: true,
    },
    {
      category: `${LL.SettingsScreen.theme()}`,
      icon: "contrast-outline",
      id: "contrast",
      action: () => navigation.navigate("theme"),
      enabled: true,
      greyed: false,
      styleDivider: true,
    },
    {
      category: LL.support.contactUs(),
      icon: "help-circle",
      id: "contact-us",
      action: toggleIsContactModalVisible,
      enabled: true,
      greyed: false,
      styleDivider: true,
    },
    {
      category: LL.SettingsScreen.rateUs({
        storeName: isIos ? "App Store" : "Play Store",
      }),
      id: "leave-feedback",
      icon: "star",
      action: rateUs,
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
      <ContactModal
        isVisible={isContactModalVisible}
        toggleModal={toggleIsContactModalVisible}
        messageBody={contactMessageBody}
        messageSubject={contactMessageSubject}
      />
    </Screen>
  )
}
