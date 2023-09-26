import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import Share from "react-native-share"

import { Screen } from "../../components/screen"
import { VersionComponent } from "../../components/version"
import type { RootStackParamList } from "../../navigation/stack-param-lists"
import KeyStoreWrapper from "../../utils/storage/secureStorage"

import ContactModal, {
  SupportChannels,
} from "@app/components/contact-modal/contact-modal"
import crashlytics from "@react-native-firebase/crashlytics"

import { gql } from "@apollo/client"
import { ModalNfc } from "@app/components/modal-nfc"
import { ratingOptions } from "@app/config"
import {
  useSettingsScreenQuery,
  useWalletCsvTransactionsLazyQuery,
} from "@app/graphql/generated"
import { AccountLevel, useLevel } from "@app/graphql/level-context"
import { useAppConfig } from "@app/hooks"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { useI18nContext } from "@app/i18n/i18n-react"
import { isIos } from "@app/utils/helper"
import { getLanguageFromString } from "@app/utils/locale-detector"
import { getLightningAddress } from "@app/utils/pay-links"
import { toastShow } from "@app/utils/toast"
import Clipboard from "@react-native-clipboard/clipboard"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "@rneui/themed"
import { getReadableVersion } from "react-native-device-info"
import Rate from "react-native-rate"
import { SettingsRow } from "./settings-row"
import { useShowWarningSecureAccount } from "./show-warning-secure-account"
import { SetLightningAddressModal } from "@app/components/set-lightning-address-modal"
import { getBtcWallet, getUsdWallet } from "@app/graphql/wallets-utils"

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
        wallets {
          id
          balance
          walletCurrency
        }
      }
    }
  }
`

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, "settings">>()

  const {
    theme: { colors },
  } = useTheme()

  const { appConfig } = useAppConfig()

  const { name: bankName } = appConfig.galoyInstance

  const { isAtLeastLevelZero, currentLevel } = useLevel()
  const { LL } = useI18nContext()

  const [contactMethods, setContactMethods] = React.useState<SupportChannels[]>([])

  const { data } = useSettingsScreenQuery({
    fetchPolicy: "cache-first",
    returnPartialData: true,
    skip: !isAtLeastLevelZero,
  })

  const { displayCurrency } = useDisplayCurrency()

  const username = data?.me?.username ?? undefined
  const language = getLanguageFromString(data?.me?.language)

  const btcWallet = getBtcWallet(data?.me?.defaultAccount?.wallets)
  const usdWallet = getUsdWallet(data?.me?.defaultAccount?.wallets)

  const btcWalletId = btcWallet?.id
  const usdWalletId = usdWallet?.id
  const defaultWalletId = data?.me?.defaultAccount?.defaultWalletId
  const defaultWalletCurrency = defaultWalletId === btcWalletId ? "BTC" : "Stablesats USD"

  const lightningAddress = username
    ? getLightningAddress(appConfig.galoyInstance.lnAddressHostname, username)
    : ""

  const [fetchCsvTransactionsQuery, { loading: loadingCsvTransactions }] =
    useWalletCsvTransactionsLazyQuery({
      fetchPolicy: "no-cache",
    })

  const showWarningSecureAccount = useShowWarningSecureAccount()

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

  const [isSetLightningAddressModalVisible, setIsSetLightningAddressModalVisible] =
    React.useState(false)
  const toggleIsSetLightningAddressModalVisible = () => {
    setIsSetLightningAddressModalVisible(!isSetLightningAddressModalVisible)
  }

  const [isNFCActive, setIsNFCActive] = React.useState(false)

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
      category: LL.SettingsScreen.logInOrCreateAccount(),
      id: "login-phone",
      icon: "person-outline",
      action: () =>
        navigation.reset({
          index: 0,
          routes: [{ name: "getStarted" }],
        }),
      hidden: currentLevel !== AccountLevel.NonAuth,
      enabled: true,
    },
    {
      category: LL.common.account(),
      chevronLogo: showWarningSecureAccount ? "alert-circle-outline" : undefined,
      chevronColor: showWarningSecureAccount ? colors.primary : undefined,
      chevronSize: showWarningSecureAccount ? 24 : undefined,
      icon: "person-outline",
      id: "account",
      action: () => navigation.navigate("accountScreen"),
      styleDivider: true,
      hidden: currentLevel === AccountLevel.NonAuth,
      enabled: true,
    },
    {
      category: LL.GaloyAddressScreen.yourAddress({ bankName }),
      icon: "at-outline",
      id: "username",
      subTitleDefaultValue: LL.SettingsScreen.tapUserName(),
      subTitleText: lightningAddress,
      action: () => {
        if (!lightningAddress) {
          toggleIsSetLightningAddressModalVisible()
          return
        }
        Clipboard.setString(lightningAddress)
        toastShow({
          message: (translations) =>
            translations.GaloyAddressScreen.copiedAddressToClipboard({
              bankName,
            }),
          type: "success",
          LL,
        })
      },
      chevronLogo: lightningAddress ? "copy-outline" : undefined,
      enabled: isAtLeastLevelZero,
      greyed: !isAtLeastLevelZero,
    },
    {
      category: LL.SettingsScreen.addressScreen(),
      icon: "custom-receive-bitcoin",
      id: "address",
      action: () => navigation.navigate("addressScreen"),
      enabled: isAtLeastLevelZero && Boolean(lightningAddress),
      greyed: !isAtLeastLevelZero || !lightningAddress,
    },
    {
      category: `${LL.SettingsScreen.nfc()} - beta`,
      icon: "radio-outline",
      id: "nfc",
      action: () => setIsNFCActive(true),
      enabled: isAtLeastLevelZero,
      greyed: !isAtLeastLevelZero,
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
      category: `${LL.common.currency()}`,
      icon: "ios-cash-outline",
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
      category: `${LL.SettingsScreen.notifications()}`,
      icon: "notifications-outline",
      id: "notification-settings",
      action: () => navigation.navigate("notificationSettingsScreen"),
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
      icon: "ios-download-outline",
      id: "csv",
      action: fetchCsvTransactions,
      enabled: isAtLeastLevelZero && !loadingCsvTransactions,
      greyed: !isAtLeastLevelZero || loadingCsvTransactions,
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
      icon: "help-circle-outline",
      id: "contact-us",
      action: () => {
        setContactMethods([
          SupportChannels.Faq,
          SupportChannels.StatusPage,
          SupportChannels.Email,
          SupportChannels.WhatsApp,
        ])
        toggleIsContactModalVisible()
      },
      enabled: true,
      greyed: false,
      styleDivider: true,
    },
    {
      category: LL.support.joinTheCommunity(),
      icon: "people-outline",
      id: "join-the-community",
      action: () => {
        setContactMethods([SupportChannels.Telegram, SupportChannels.Mattermost])

        toggleIsContactModalVisible()
      },
      enabled: true,
      greyed: false,
      styleDivider: true,
    },
    {
      category: LL.SettingsScreen.rateUs({
        storeName: isIos ? "App Store" : "Play Store",
      }),
      id: "leave-feedback",
      icon: "star-outline",
      action: rateUs,
      enabled: true,
      greyed: false,
    },
  ]

  return (
    <Screen preset="scroll" keyboardShouldPersistTaps="handled">
      {settingsList.map((setting) => (
        <SettingsRow setting={setting} key={setting?.id} />
      ))}
      <VersionComponent />
      <ContactModal
        isVisible={isContactModalVisible}
        toggleModal={toggleIsContactModalVisible}
        messageBody={contactMessageBody}
        messageSubject={contactMessageSubject}
        supportChannels={contactMethods}
      />
      <SetLightningAddressModal
        isVisible={isSetLightningAddressModalVisible}
        toggleModal={toggleIsSetLightningAddressModalVisible}
      />
      <ModalNfc isActive={isNFCActive} setIsActive={setIsNFCActive} />
    </Screen>
  )
}
