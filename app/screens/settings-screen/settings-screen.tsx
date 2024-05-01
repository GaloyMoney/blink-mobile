import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import Share from "react-native-share"

import { Screen } from "../../components/screen"
import { VersionComponent } from "../../components/version"
import type { RootStackParamList } from "../../navigation/stack-param-lists"
import KeyStoreWrapper from "../../utils/storage/secureStorage"

import ContactModal, {
  SupportChannels,
  SupportChannelsToHide,
} from "@app/components/contact-modal/contact-modal"
import crashlytics from "@react-native-firebase/crashlytics"

import { gql } from "@apollo/client"
import { ratingOptions } from "@app/config"
import {
  useAccountUpdateDefaultWalletIdMutation,
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
import { ShowNostrSecret } from "./show-nostr-secret"
import { useAppDispatch, useAppSelector } from "@app/store/redux"
import { updateSettings } from "@app/store/redux/slices/settingsSlice"
import { save } from "@app/utils/storage"
import { Alert } from "react-native"
import useBreezBalance from "@app/hooks/useBreezBalance"
import { toBtcMoneyAmount } from "@app/types/amounts"

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
  const dispatch = useAppDispatch()
  const { isAdvanceMode } = useAppSelector((state) => state.settings)
  const { moneyAmountToDisplayCurrencyString } = useDisplayCurrency()
  const [breezBalance] = useBreezBalance()
  const {
    theme: { colors },
  } = useTheme()

  const { appConfig } = useAppConfig()

  const { name: bankName } = appConfig.galoyInstance

  const { isAtLeastLevelZero, currentLevel } = useLevel()
  const { LL } = useI18nContext()
  const [hiddenContactMethods, setHiddenContactMethods] = React.useState<
    SupportChannelsToHide[]
  >([SupportChannels.Telegram, SupportChannels.Mattermost])

  const { data } = useSettingsScreenQuery({
    fetchPolicy: "cache-first",
    returnPartialData: true,
    skip: !isAtLeastLevelZero,
  })

  const [accountUpdateDefaultWallet, { loading }] =
    useAccountUpdateDefaultWalletIdMutation()

  const { displayCurrency } = useDisplayCurrency()

  const username = data?.me?.username ?? undefined
  const language = getLanguageFromString(data?.me?.language)

  const btcWallet = getBtcWallet(data?.me?.defaultAccount?.wallets)
  const usdWallet = getUsdWallet(data?.me?.defaultAccount?.wallets)

  const btcWalletId = btcWallet?.id
  const usdWalletId = usdWallet?.id
  const defaultWalletId = data?.me?.defaultAccount?.defaultWalletId
  const defaultWalletCurrency = defaultWalletId === btcWalletId ? "BTC" : "Cash (USD)"

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

  const [showNostrSecret, setShowNostrSecret] = React.useState(false)

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

  const handleSetDefaultWallet = async () => {
    if (loading) return
    if (usdWallet) {
      await accountUpdateDefaultWallet({
        variables: {
          input: {
            walletId: usdWallet?.id,
          },
        },
      })
    }
  }

  const toggleAdvanceMode = () => {
    if (isAdvanceMode) {
      if (breezBalance && breezBalance > 0) {
        const btcWalletBalance = toBtcMoneyAmount(breezBalance || 0)
        const convertedBalance =
          moneyAmountToDisplayCurrencyString({
            moneyAmount: btcWalletBalance,
            isApproximate: true,
          }) || "0"
        const btcBalanceWarning = LL.AccountScreen.btcBalanceWarning({
          balance: convertedBalance,
        })

        const fullMessage = btcBalanceWarning + "\n" + LL.support.switchToBeginnerMode()

        Alert.alert(LL.common.warning(), fullMessage, [
          { text: LL.common.cancel(), onPress: () => {} },
          {
            text: LL.common.yes(),
            onPress: () => toggleAdvanceModeComplete(false),
          },
        ])
      } else {
        toggleAdvanceModeComplete(false)
      }
    } else {
      toggleAdvanceModeComplete(true)
    }
  }

  const toggleAdvanceModeComplete = (isAdvanceMode: boolean) => {
    if (!isAdvanceMode) {
      handleSetDefaultWallet()
    }
    dispatch(updateSettings({ isAdvanceMode }))
    save("isAdvanceMode", isAdvanceMode)
    setTimeout(() => navigation.goBack(), 500)
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
          currentTranslation: LL,
        })
      },
      chevronLogo: lightningAddress ? "copy" : undefined,
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
      category: LL.SettingsScreen.showNostrSecret(),
      icon: "globe-outline",
      id: "nostrSecret",
      action: () => {
        setShowNostrSecret(true)
      },
      enabled: true,
      chevron: true,
    },
    {
      category: isAdvanceMode
        ? LL.SettingsScreen.beginnerMode()
        : LL.SettingsScreen.advanceMode(),
      icon: isAdvanceMode ? "invert-mode-outline" : "invert-mode",
      id: "enableBtcWallet",
      action: toggleAdvanceMode,
      enabled: true,
      chevron: true,
    },
    {
      category: LL.SettingsScreen.backup(),
      icon: "apps-outline",
      id: "backup",
      action: () => navigation.navigate("BackupOptions"),
      enabled: isAtLeastLevelZero,
      greyed: !isAtLeastLevelZero,
      chevron: true,
    },
    {
      category: LL.SettingsScreen.importWallet(),
      icon: "grid-outline",
      id: "importWallet",
      action: () => navigation.navigate("ImportWalletOptions", { insideApp: true }),
      enabled: isAtLeastLevelZero,
      greyed: !isAtLeastLevelZero,
      chevron: true,
    },
    {
      category: LL.common.language(),
      icon: "language",
      id: "language",
      subTitleText: language,
      action: () => navigation.navigate("language"),
      enabled: isAtLeastLevelZero,
      greyed: !isAtLeastLevelZero,
    },
    {
      category: `${LL.common.currency()}`,
      icon: "cash",
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
      enabled: isAdvanceMode ? isAtLeastLevelZero : false,
      greyed: isAdvanceMode ? !isAtLeastLevelZero : true,
    },
    {
      category: LL.common.security(),
      icon: "lock-closed-outline",
      id: "security",
      action: securityAction,
      enabled: isAtLeastLevelZero,
      greyed: !isAtLeastLevelZero,
    },
    // {
    //   category: LL.common.csvExport(),
    //   icon: "download",
    //   id: "csv",
    //   action: fetchCsvTransactions,
    //   enabled: isAtLeastLevelZero && !loadingCsvTransactions,
    //   greyed: !isAtLeastLevelZero || loadingCsvTransactions,
    // },
    {
      category: `${LL.SettingsScreen.theme()}`,
      icon: "contrast-outline",
      id: "contrast",
      action: () => navigation.navigate("theme"),
      enabled: true,
      greyed: false,
      // styleDivider: true,
    },
    {
      category: LL.support.contactUs(),
      icon: "help-circle",
      id: "contact-us",
      action: () => {
        setHiddenContactMethods([
          SupportChannels.Telegram,
          SupportChannels.Mattermost,
          SupportChannels.StatusPage,
          SupportChannels.WhatsApp,
        ])
        toggleIsContactModalVisible()
      },
      enabled: true,
      greyed: false,
      // styleDivider: true,
    },
    {
      category: LL.support.joinTheCommunity(),
      icon: "people",
      id: "join-the-community",
      action: () => {
        setHiddenContactMethods([
          SupportChannels.Email,
          SupportChannels.StatusPage,
          SupportChannels.WhatsApp,
          SupportChannels.Mattermost,
        ])

        toggleIsContactModalVisible()
      },
      enabled: true,
      greyed: false,
      // styleDivider: true,
    },
    // {
    //   category: LL.SettingsScreen.rateUs({
    //     storeName: isIos ? "App Store" : "Play Store",
    //   }),
    //   id: "leave-feedback",
    //   icon: "star",
    //   action: rateUs,
    //   enabled: true,
    //   greyed: false,
    // },
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
        supportChannelsToHide={hiddenContactMethods}
      />
      <SetLightningAddressModal
        isVisible={isSetLightningAddressModalVisible}
        toggleModal={toggleIsSetLightningAddressModalVisible}
      />
      <ShowNostrSecret
        isActive={showNostrSecret}
        onCancel={() => {
          setShowNostrSecret(false)
        }}
      />
    </Screen>
  )
}
