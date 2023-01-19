import * as React from "react"
import { Alert } from "react-native"
import Share from "react-native-share"
import { StackNavigationProp } from "@react-navigation/stack"

import { Screen } from "../../components/screen"
import { VersionComponent } from "../../components/version"
import { palette } from "../../theme/palette"
import KeyStoreWrapper from "../../utils/storage/secureStorage"
import type { ScreenType } from "../../types/jsx"
import type { RootStackParamList } from "../../navigation/stack-param-lists"

import useToken from "../../hooks/use-token"
import crashlytics from "@react-native-firebase/crashlytics"
import ContactModal from "@app/components/contact-modal/contact-modal"

import { useI18nContext } from "@app/i18n/i18n-react"
import { SettingsRow } from "./settings-row"
import {
  WalletCsvTransactionsQuery,
  useSettingsScreenQuery,
  useWalletCsvTransactionsLazyQuery,
} from "@app/graphql/generated"
import { gql } from "@apollo/client"
import { bankName } from "@app/config"

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "settings">
}

gql`
  query walletCSVTransactions($defaultWalletId: WalletId!) {
    me {
      id
      defaultAccount {
        id
        csvTransactions(walletIds: [$defaultWalletId])
      }
    }
  }

  query settingsScreen {
    me {
      phone
      username
      language
      defaultAccount {
        btcWallet {
          id
        }
      }
    }
  }
`

export const SettingsScreen: ScreenType = ({ navigation }: Props) => {
  const { hasToken } = useToken()
  const { LL } = useI18nContext()

  const { data } = useSettingsScreenQuery({
    fetchPolicy: "cache-only",
    returnPartialData: true,
  })

  const username = data?.me?.username
  const phone = data?.me?.phone
  const language = data?.me?.language ?? "DEFAULT"
  const btcWalletId = data?.me?.defaultAccount?.btcWallet?.id

  const onGetCsvCallback = async (data: WalletCsvTransactionsQuery) => {
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
      crashlytics().recordError(err)
      console.error(err)
    }
  }

  const [fetchCsvTransactions, { loading: loadingCsvTransactions, called, refetch }] =
    useWalletCsvTransactionsLazyQuery({
      fetchPolicy: "no-cache",
      notifyOnNetworkStatusChange: true,
      onCompleted: onGetCsvCallback,
      onError: (error) => {
        crashlytics().recordError(error)
        Alert.alert(LL.common.error(), LL.SettingsScreen.csvTransactionsError(), [
          { text: LL.common.ok() },
        ])
      },
    })

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
      language={LL.Languages[language]()}
      csvAction={() => {
        if (called) {
          // FIXME: do we only fetch the csv from the btc wallet?
          refetch({ defaultWalletId: btcWalletId })
        } else {
          btcWalletId &&
            fetchCsvTransactions({
              variables: { defaultWalletId: btcWalletId },
            })
        }
      }}
      securityAction={securityAction}
      loadingCsvTransactions={loadingCsvTransactions}
    />
  )
}

export const SettingsScreenJSX: ScreenType = (params: SettingsScreenProps) => {
  const [isContactModalVisible, setIsContactModalVisible] = React.useState(false)
  const { LL } = useI18nContext()
  const {
    hasToken,
    navigation,
    phone,
    language,
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
        isVisble={isContactModalVisible}
        toggleModal={toggleIsContactModalVisible}
      />
    </Screen>
  )
}
