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
import useToken from "../../hooks/use-token"

import { gql } from "@apollo/client"
import {
  useSettingsScreenQuery,
  useWalletCsvTransactionsLazyQuery,
} from "@app/graphql/generated"
import { useAppConfig } from "@app/hooks"
import { useI18nContext } from "@app/i18n/i18n-react"
import { SettingsRow } from "./settings-row"

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "settings">
}

gql`
  query walletCSVTransactions($walletIds: [WalletId!]!) {
    me {
      id
      defaultAccount {
        id
        csvTransactions(walletIds: walletIds)
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

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { appConfig } = useAppConfig()
  const { name: bankName } = appConfig.galoyInstance

  const { hasToken } = useToken()
  const { LL } = useI18nContext()

  const { data } = useSettingsScreenQuery({
    fetchPolicy: "cache-first",
    returnPartialData: true,
  })

  const username = data?.me?.username ?? undefined
  const phone = data?.me?.phone ?? undefined
  const userPreferredLanguage = data?.me?.language || "DEFAULT"

  // FIXME: having an enum for language on the API would fix this issue
  let language = "FIXME: error missing language" // should not appear unless there is a bug
  if (Object.keys(LL.Languages).indexOf(userPreferredLanguage) !== -1) {
    type LanguageQuery = keyof typeof LL.Languages
    const languageQueryTyped = userPreferredLanguage as LanguageQuery
    language = LL.Languages[languageQueryTyped]()
  }

  const btcWalletId = data?.me?.defaultAccount?.btcWallet?.id
  const usdWalletId = data?.me?.defaultAccount?.usdWallet?.id

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

  return (
    <SettingsScreenJSX
      hasToken={hasToken}
      navigation={navigation}
      username={username}
      phone={phone}
      bankName={bankName}
      language={language}
      csvAction={fetchCsvTransactions}
      securityAction={securityAction}
      loadingCsvTransactions={loadingCsvTransactions}
    />
  )
}

export const SettingsScreenJSX: React.FC<SettingsScreenProps> = (params) => {
  const [isContactModalVisible, setIsContactModalVisible] = React.useState(false)
  const { LL } = useI18nContext()
  const {
    hasToken,
    navigation,
    phone,
    language,
    bankName,
    csvAction,
    securityAction,
    loadingCsvTransactions,
  } = params

  const toggleIsContactModalVisible = () => {
    setIsContactModalVisible(!isContactModalVisible)
  }

  const settingList: SettingRow[] = [
    {
      category: LL.common.phoneNumber(),
      icon: "call",
      id: "phone",
      subTitleDefaultValue: LL.SettingsScreen.tapLogIn(),
      subTitleText: phone,
      action: () => navigation.navigate("phoneValidation"),
      enabled: !hasToken,
      greyed: hasToken,
    },
    {
      category: LL.SettingsScreen.addressScreen({ bankName }),
      icon: "custom-receive-bitcoin",
      id: "address",
      action: () => navigation.navigate("addressScreen"),
      enabled: hasToken,
      greyed: !hasToken,
    },
    {
      category: LL.common.transactionLimits(),
      id: "limits",
      icon: "custom-info-icon",
      action: () => navigation.navigate("transactionLimitsScreen"),
      enabled: hasToken,
      greyed: !hasToken,
    },
    {
      category: LL.common.language(),
      icon: "ios-language",
      id: "language",
      subTitleText: language,
      action: () => navigation.navigate("language"),
      enabled: hasToken,
      greyed: !hasToken,
    },
    {
      category: LL.common.security(),
      icon: "lock-closed-outline",
      id: "security",
      action: securityAction,
      enabled: hasToken,
      greyed: !hasToken,
    },
    {
      category: LL.common.csvExport(),
      icon: "ios-download",
      id: "csv",
      action: () => csvAction(),
      enabled: hasToken && !loadingCsvTransactions,
      greyed: !hasToken || loadingCsvTransactions,
    },
    {
      category: LL.support.contactUs(),
      icon: "help-circle",
      id: "contact-us",
      action: toggleIsContactModalVisible,
      enabled: true,
      greyed: false,
    },
    {
      category: LL.common.account(),
      icon: "person-outline",
      id: "account",
      action: () => navigation.navigate("accountScreen"),
      enabled: hasToken,
      greyed: !hasToken,
      styleDivider: { backgroundColor: palette.lighterGrey, height: 18 },
    },
  ]

  return (
    <Screen preset="scroll">
      {settingList.map((setting) => (
        <SettingsRow setting={setting} key={setting.id} />
      ))}
      <VersionComponent />
      <ContactModal
        isVisible={isContactModalVisible}
        toggleModal={toggleIsContactModalVisible}
      />
    </Screen>
  )
}
